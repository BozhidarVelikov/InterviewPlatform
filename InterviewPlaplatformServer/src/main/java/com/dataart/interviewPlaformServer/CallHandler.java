package com.dataart.interviewPlaformServer;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import org.kurento.client.EventListener;
import org.kurento.client.IceCandidate;
import org.kurento.client.IceCandidateFoundEvent;
import org.kurento.client.KurentoClient;
import org.kurento.jsonrpc.JsonUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;

public class CallHandler extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(CallHandler.class);
    private static final Gson gson = new GsonBuilder().create();

    private final ConcurrentHashMap<String, CallMediaPipeline> pipelines = new ConcurrentHashMap<>();

    @Autowired
    private KurentoClient kurento;

    @Autowired
    private UserRegistry registry;

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {

        JsonObject jsonMessage = gson.fromJson(message.getPayload(), JsonObject.class);
        UserSession user = registry.getBySession(session);

        if (user != null) {
            log.debug("Message from {}: {}", user.getName(), jsonMessage);
        } else {
            log.debug("Message from new user: {}", jsonMessage);
        }

        switch (jsonMessage.get("id").getAsString()) {

            case "register":
                try {
                    register(session, jsonMessage);
                } catch (Throwable t) {
                    handleErrorResponse(t, session, "Register Response");
                }
                break;
            case "call":
                try {
                    call(user, jsonMessage);
                } catch (Throwable t) {
                    handleErrorResponse(t, session, "Call Response");
                }
                break;
            case "incomingCallResponse":
                incomingCallResponse(user, jsonMessage);
                break;
            case "onIceCandidate":
                JsonObject candidate = jsonMessage.get("candidate").getAsJsonObject();
                if (user != null) {
                    IceCandidate cand = new IceCandidate(candidate.get("candidate").getAsString(),
                            candidate.get("sdpMid").getAsString(), candidate.get("sdpMLineIndex").getAsInt());
                    user.addCandidate(cand);
                }
                break;
            case "stop":
                stop(session);
                break;
            default:
                break;
        }
    }

    private void handleErrorResponse(Throwable t, WebSocketSession session, String responseId) throws IOException {

        stop(session);
        log.error(t.getMessage(), t);
        JsonObject response = new JsonObject();
        response.addProperty("id", responseId);
        response.addProperty("response", "Rejected");
        response.addProperty("message", t.getMessage());
        session.sendMessage(new TextMessage(response.toString()));
    }

    private void register(WebSocketSession session, JsonObject jsonMessage) throws IOException {

        String name = jsonMessage.getAsJsonPrimitive("name").getAsString();

        UserSession caller = new UserSession(session, name);
        String responseMessage = "Accepted";
        registry.register(caller);

        JsonObject response = new JsonObject();
        response.addProperty("id", "Register Response");
        response.addProperty("response", responseMessage);
        caller.sendMessage(response);
    }

    private void call(UserSession caller, JsonObject jsonMessage) throws IOException {

        String to = jsonMessage.get("to").getAsString();
        String from = jsonMessage.get("from").getAsString();
        JsonObject response = new JsonObject();

        if(registry.exists(to)) {

            UserSession callee = registry.getByName(to);
            caller.setSdpOffer(jsonMessage.getAsJsonPrimitive("sdpOffer").getAsString());
            caller.setCallingTo(to);

            response.addProperty("id", "Incoming Call");
            response.addProperty("from", from);

            callee.sendMessage(response);
            callee.setCallingFrom(from);
        } else {

            response.addProperty("id", "Call Response");
            response.addProperty("response", "User " + to + "is not registered");
        }

        caller.sendMessage(response);
    }

    private void incomingCallResponse(final UserSession callee, JsonObject jsonMessage) throws IOException {

        String callResponse = jsonMessage.get("callResponse").getAsString();
        String from = jsonMessage.get("from").getAsString();
        final UserSession calleer = registry.getByName(from);
        String to = calleer.getCallingTo();

        if("Accept".equals(callResponse)) {

            log.debug("Accepted call from '{}' to '{}'", from, to);

            CallMediaPipeline pipeline = null;
            try {
                pipeline = new CallMediaPipeline(kurento);
                pipelines.put(calleer.getSessionId(), pipeline);
                pipelines.put(callee.getSessionId(), pipeline);

                String calleeSdpOffer = jsonMessage.get("sdpOffer").getAsString();
                callee.setWebRtcEndpoint(pipeline.getCalleeWebRtcEP());
                pipeline.getCalleeWebRtcEP().addIceCandidateFoundListener(new EventListener<IceCandidateFoundEvent>() {

                    @Override
                    public void onEvent(IceCandidateFoundEvent event) {

                        JsonObject response = new JsonObject();
                        response.addProperty("id", "ICE Candidate");
                        response.add("candidate", JsonUtils.toJsonObject(event.getCandidate()));
                        try {
                            synchronized (callee.getSession()) {
                                callee.getSession().sendMessage(new TextMessage(response.toString()));
                            }
                        } catch (IOException e) {
                            log.debug(e.getMessage());
                        }
                    }
                });

                String calleeSdpAnswer = pipeline.generateSdpAnswerForCallee(calleeSdpOffer);
                String callerSdpOffer = registry.getByName(from).getSdpOffer();
                calleer.setWebRtcEndpoint(pipeline.getCallerWebRtcEP());

                pipeline.getCallerWebRtcEP().addIceCandidateFoundListener(new EventListener<IceCandidateFoundEvent>() {

                    @Override
                    public void onEvent(IceCandidateFoundEvent event) {
                        JsonObject response = new JsonObject();
                        response.addProperty("id", "ICE Candidate");
                        response.add("candidate", JsonUtils.toJsonObject(event.getCandidate()));
                        try {
                            synchronized (calleer.getSession()) {
                                calleer.getSession().sendMessage(new TextMessage(response.toString()));
                            }
                        } catch (IOException e) {
                            log.debug(e.getMessage());
                        }
                    }
                });

                String callerSdpAnswer = pipeline.generateSdpAnswerForCaller(callerSdpOffer);
                JsonObject startCommunication = new JsonObject();
                startCommunication.addProperty("id", "Start Communication");
                startCommunication.addProperty("sdpAnswer", calleeSdpAnswer);

                synchronized (callee) {
                    callee.sendMessage(startCommunication);
                }

                pipeline.getCalleeWebRtcEP().gatherCandidates();
                JsonObject response = new JsonObject();
                response.addProperty("id", "Call Response");
                response.addProperty("response", "Accepted");
                response.addProperty("sdpAnswer", callerSdpAnswer);

                synchronized (calleer) {
                    calleer.sendMessage(response);
                }

                pipeline.getCallerWebRtcEP().gatherCandidates();

            } catch (Throwable t) {
                log.error(t.getMessage(), t);

                if (pipeline != null) {

                    pipeline.release();
                }

                pipelines.remove(calleer.getSessionId());
                pipelines.remove(callee.getSessionId());

                JsonObject response = new JsonObject();
                response.addProperty("id", "Call Response");
                response.addProperty("response", "Rejected");
                calleer.sendMessage(response);

                response = new JsonObject();
                response.addProperty("id", "Stop Communication");
                callee.sendMessage(response);
            }
        } else {

            JsonObject response = new JsonObject();
            response.addProperty("id", "Call Response");
            response.addProperty("response", "Rejected");
            calleer.sendMessage(response);
        }
    }

    public void stop(WebSocketSession session) throws IOException {

        String sessionId = session.getId();
        if(pipelines.containsKey(sessionId)) {

            pipelines.get(sessionId).release();
            CallMediaPipeline pipeline = pipelines.remove(sessionId);
            pipeline.release();

            UserSession stopperUser = registry.getBySession(session);
            if(stopperUser != null) {

                UserSession stoppedUser = (stopperUser.getCallingFrom() != null)
                        ? registry.getByName(stopperUser.getCallingFrom())
                        : stopperUser.getCallingTo() != null
                        ? registry.getByName(stopperUser.getCallingTo())
                        : null;

                if(stoppedUser != null) {

                    JsonObject message = new JsonObject();
                    message.addProperty("id", "Stop Communication");
                    stoppedUser.sendMessage(message);
                    stoppedUser.clear();
                }

                stopperUser.clear();
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        stop(session);
        registry.removeBySession(session);
    }
}
