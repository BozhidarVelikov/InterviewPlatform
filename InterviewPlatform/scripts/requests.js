let http;

// Check if user use modern or old browsers 
if (window.XMLHttpRequest) {
    http = new XMLHttpRequest();
} else {
    http = new ActiveXObject("Microsoft.XMLHTTP");
}

const sendRequest = (method, route, payload) => {
    return new Promise((resolve, reject) => {
        let url = "http://localhost:3000" + route;
        let response;
        let token = localStorage.getItem("token");

        http.onload = function() {
            if (this.readyState === 4 && this.status === 200) {
             
                // parse JSON data from API to a javaScript Object
                response = JSON.parse(http.responseText);

              resolve(response);
            }
            if (this.status === 400) {
              errorMsg = http.responseText;
              reject(errorMsg);
            }
            if (this.status === 404) {
              errorMsg = http.responseText;
              reject(errorMsg);
            }
        };

        http.onerror = function() {
            const notFound = {msg:'Something went wrong! Please try again latter.'};
            reject(notFound);
        };

        http.open(method, url, true);
		http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        http.setRequestHeader("auth-token", token);

        if(method === "POST") {
        	http.send(JSON.stringify(payload));	
        } else {
        }
    });
}


