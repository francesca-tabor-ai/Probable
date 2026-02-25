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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
export function useForecasts() {
    var _this = this;
    return useQuery({
        queryKey: [api.forecasts.list.path],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var res, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch(api.forecasts.list.path, { credentials: "include" })];
                    case 1:
                        res = _a.sent();
                        if (!res.ok)
                            throw new Error("Failed to fetch forecasts");
                        return [4 /*yield*/, res.json()];
                    case 2:
                        data = _a.sent();
                        return [2 /*return*/, api.forecasts.list.responses[200].parse(data)];
                }
            });
        }); },
    });
}
export function useCreateForecast() {
    var _this = this;
    var queryClient = useQueryClient();
    return useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch(api.forecasts.create.path, {
                            method: api.forecasts.create.method,
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(data),
                            credentials: "include",
                        })];
                    case 1:
                        res = _a.sent();
                        if (!res.ok)
                            throw new Error("Failed to create forecast");
                        return [4 /*yield*/, res.json()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: [api.forecasts.list.path] });
            queryClient.invalidateQueries({ queryKey: [api.dashboard.stats.path] });
        },
    });
}
export function useUpdateForecast() {
    var _this = this;
    var queryClient = useQueryClient();
    return useMutation({
        mutationFn: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var url, res;
            var id = _b.id, data = _b.data;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        url = buildUrl(api.forecasts.update.path, { id: id });
                        return [4 /*yield*/, fetch(url, {
                                method: api.forecasts.update.method,
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(data),
                                credentials: "include",
                            })];
                    case 1:
                        res = _c.sent();
                        if (!res.ok)
                            throw new Error("Failed to update forecast");
                        return [4 /*yield*/, res.json()];
                    case 2: return [2 /*return*/, _c.sent()];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: [api.forecasts.list.path] });
            queryClient.invalidateQueries({ queryKey: [api.dashboard.stats.path] });
        },
    });
}
export function useDeleteForecast() {
    var _this = this;
    var queryClient = useQueryClient();
    return useMutation({
        mutationFn: function (id) { return __awaiter(_this, void 0, void 0, function () {
            var url, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = buildUrl(api.forecasts.delete.path, { id: id });
                        return [4 /*yield*/, fetch(url, {
                                method: api.forecasts.delete.method,
                                credentials: "include",
                            })];
                    case 1:
                        res = _a.sent();
                        if (!res.ok)
                            throw new Error("Failed to delete forecast");
                        return [2 /*return*/];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: [api.forecasts.list.path] });
            queryClient.invalidateQueries({ queryKey: [api.dashboard.stats.path] });
        },
    });
}
