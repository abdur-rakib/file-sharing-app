"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Workspace = exports.DbConnectivity = exports.HttpLogger = void 0;
var HttpLogger;
(function (HttpLogger) {
    HttpLogger["HTTP_REQUEST"] = "HTTP_REQUEST";
})(HttpLogger || (exports.HttpLogger = HttpLogger = {}));
var DbConnectivity;
(function (DbConnectivity) {
    DbConnectivity["DB_CONNECTIVITY"] = "DB_CONNECTIVITY";
})(DbConnectivity || (exports.DbConnectivity = DbConnectivity = {}));
var Workspace;
(function (Workspace) {
    Workspace["CREATE_NAMESPACE"] = "CREATE_NAMESPACE";
    Workspace["GET_ALL_NAMESPACES"] = "GET_ALL_NAMESPACES";
    Workspace["GET_NAMESPACE"] = "GET_NAMESPACE";
    Workspace["UPDATE_NAMESPACE"] = "UPDATE_NAMESPACE";
    Workspace["DELETE_NAMESPACE"] = "DELETE_NAMESPACE";
})(Workspace || (exports.Workspace = Workspace = {}));
//# sourceMappingURL=logging-tag.enum.js.map