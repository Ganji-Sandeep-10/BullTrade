import type { User } from "@prisma/client";
import { randomUUID } from "crypto";
import { cancelEngineResponseWait, waitForEngineResponse } from "./redis_service.js";
import { addToStreamWithTrim } from "@exness-v3/redis/stream-utils";

const ENGINE_STREAM_MAXLEN = Number(process.env.ENGINE_STREAM_MAXLEN ?? 50000);

export async function createUserInEngine(user: User) {
    const requestId = randomUUID();
    const replyTo = `stream:engine:response:${requestId}`;

    const payload = {
        type: 'USER_CREATED',
        requestId,
        replyTo,
        data: JSON.stringify({
            email: user.email,
            password: user.password,
            id: user.id,
            balance: user.balance,
        }),
    };

    const responsePromise = waitForEngineResponse(requestId, replyTo);
    try {
        await addToStreamWithTrim('stream:engine', '*', payload, ENGINE_STREAM_MAXLEN);
    } catch (err) {
        cancelEngineResponseWait(requestId);
        throw err;
    }
    const res = await responsePromise;
    return res;
}

export async function getUserBalanceFromEngine(email: string, password: string) {
    const requestId = randomUUID();
    const replyTo = `stream:engine:response:${requestId}`;

    const payload = {
        type: 'GET_USER_BALANCE',
        requestId,
        replyTo,
        data: JSON.stringify({
            email: email,
            password: password,
        }),
    };  

    const responsePromise = waitForEngineResponse(requestId, replyTo);
    let res1: any;
    try {
        res1 = await addToStreamWithTrim('stream:engine', '*', payload, ENGINE_STREAM_MAXLEN);
    } catch (err) {
        cancelEngineResponseWait(requestId);
        throw err;
    }
    console.log(res1);
    const res = await responsePromise;
    console.log(res)
    return res.balance;
}