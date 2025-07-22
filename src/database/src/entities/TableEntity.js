"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.asTable = void 0;
const moment_1 = __importDefault(require("moment"));
const asTable = (entity) => {
    const { id, name, sb_size, bb_size, min_buy_in, max_buy_in, game_type, created_at, } = entity;
    return {
        id,
        name,
        sbSize: sb_size,
        bbSize: bb_size,
        minBuyIn: min_buy_in,
        maxBuyIn: max_buy_in,
        gameType: game_type,
        createdAt: (0, moment_1.default)(created_at),
    };
};
exports.asTable = asTable;
