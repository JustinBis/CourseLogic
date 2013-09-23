Simply run server.js with the latest version of node.js to start the server.
In addition to the standard modules, this server requies connect to be installed.
Connect can be installed via npm as follows:
>_ npm install connect


The server runs connect on port 80 by default to serve the html pages
A second HTTP server is run on port 8088, as it is simply a JSON response server and all calls should be coming through Ajax requests