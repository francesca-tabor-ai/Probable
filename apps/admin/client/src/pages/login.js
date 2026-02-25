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
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
export default function Login() {
    var _a = useState(""), email = _a[0], setEmail = _a[1];
    var _b = useState(""), password = _b[0], setPassword = _b[1];
    var _c = useState(""), error = _c[0], setError = _c[1];
    var _d = useState(false), isSubmitting = _d[0], setIsSubmitting = _d[1];
    var login = useAuth().login;
    var _e = useLocation(), setLocation = _e[1];
    function handleSubmit(e) {
        return __awaiter(this, void 0, void 0, function () {
            var err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        e.preventDefault();
                        setError("");
                        setIsSubmitting(true);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, login(email, password)];
                    case 2:
                        _a.sent();
                        setLocation("/");
                        return [3 /*break*/, 5];
                    case 3:
                        err_1 = _a.sent();
                        setError(err_1 instanceof Error ? err_1.message : "Login failed");
                        return [3 /*break*/, 5];
                    case 4:
                        setIsSubmitting(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-background p-4", children: _jsxs(Card, { className: "w-full max-w-md", children: [_jsx(CardHeader, { className: "space-y-1", children: _jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "w-12 h-12 rounded-xl bg-gradient-signature flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-amber-500/20", children: "P" }), _jsxs("div", { children: [_jsx(CardTitle, { className: "text-2xl", children: "Sign in" }), _jsx(CardDescription, { children: "Data Desk" })] })] }) }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs(CardContent, { className: "space-y-4", children: [error && (_jsx("div", { className: "rounded-lg bg-destructive/10 text-destructive text-sm px-4 py-3", children: error })), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsx(Input, { id: "email", type: "email", placeholder: "you@example.com", value: email, onChange: function (e) { return setEmail(e.target.value); }, required: true, autoComplete: "email", disabled: isSubmitting })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "password", children: "Password" }), _jsx(Input, { id: "password", type: "password", value: password, onChange: function (e) { return setPassword(e.target.value); }, required: true, autoComplete: "current-password", disabled: isSubmitting })] })] }), _jsxs(CardFooter, { className: "flex flex-col gap-4", children: [_jsx(Button, { type: "submit", className: "w-full", disabled: isSubmitting, children: isSubmitting ? "Signing in…" : "Sign in" }), _jsxs("p", { className: "text-sm text-muted-foreground text-center", children: ["Don't have an account?", " ", _jsx(Link, { href: "/signup", className: "font-medium text-primary hover:underline", children: "Sign up" })] })] })] })] }) }));
}
