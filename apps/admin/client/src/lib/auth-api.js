/** Auth API - sign up, log in, current user. */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var AUTH_BASE = "/api/v1/auth";
var TOKEN_KEY = "probable_token";
/** Get the stored token for API requests. */
export function getAuthToken() {
    return typeof localStorage !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
}
export function setAuthToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}
export function clearAuthToken() {
    localStorage.removeItem(TOKEN_KEY);
}
/** Fetch with Bearer token. Use for API calls that need auth. */
export function authFetch(url, init) {
    return __awaiter(this, void 0, void 0, function () {
        var token, headers;
        return __generator(this, function (_a) {
            token = getAuthToken();
            headers = new Headers(init === null || init === void 0 ? void 0 : init.headers);
            if (token)
                headers.set("Authorization", "Bearer ".concat(token));
            return [2 /*return*/, fetch(url, __assign(__assign({}, init), { credentials: "include", headers: headers }))];
        });
    });
}
export function signUp(input) {
    return __awaiter(this, void 0, void 0, function () {
        var res, err;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, fetch("".concat(AUTH_BASE, "/signup"), {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: input.email,
                            password: input.password,
                            full_name: (_a = input.full_name) !== null && _a !== void 0 ? _a : null,
                        }),
                        credentials: "include",
                    })];
                case 1:
                    res = _c.sent();
                    if (!!res.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, res.json().catch(function () { return ({}); })];
                case 2:
                    err = _c.sent();
                    throw new Error((_b = err.detail) !== null && _b !== void 0 ? _b : "Sign up failed: ".concat(res.status));
                case 3: return [2 /*return*/, res.json()];
            }
        });
    });
}
export function login(input) {
    return __awaiter(this, void 0, void 0, function () {
        var res, err;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, fetch("".concat(AUTH_BASE, "/login"), {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(input),
                        credentials: "include",
                    })];
                case 1:
                    res = _b.sent();
                    if (!!res.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, res.json().catch(function () { return ({}); })];
                case 2:
                    err = _b.sent();
                    throw new Error((_a = err.detail) !== null && _a !== void 0 ? _a : "Login failed: ".concat(res.status));
                case 3: return [2 /*return*/, res.json()];
            }
        });
    });
}
export function getMe(token) {
    return __awaiter(this, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(AUTH_BASE, "/me"), {
                        headers: { Authorization: "Bearer ".concat(token) },
                        credentials: "include",
                    })];
                case 1:
                    res = _a.sent();
                    if (!res.ok) {
                        if (res.status === 401)
                            throw new Error("Unauthorized");
                        throw new Error("Failed to fetch user: ".concat(res.status));
                    }
                    return [2 /*return*/, res.json()];
            }
        });
    });
}
