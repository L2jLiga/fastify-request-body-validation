import { Static, Type } from '@sinclair/typebox';
import { deepStrictEqual, strictEqual } from 'assert';
import fastify, { FastifyRequest } from 'fastify';

const app = fastify();

const schemaNonNull = Type.Object({ name: Type.String() });
const schemaNullable = Type.Union([Type.Object({ name: Type.String() }), Type.Null()]);

type NonNull = Static<typeof schemaNonNull>
type Nullable = Static<typeof schemaNullable>

app.post('/non-null', { schema: { body: schemaNonNull } }, async (request: FastifyRequest<{ Body: NonNull }>) => {
    // Boy non nullable
    return request.body.name;
});

app.post('/nullable', { schema: { body: schemaNullable } }, async (request: FastifyRequest<{ Body: Nullable }>) => {
    // Body explicitly nullable
    return request.body?.name ?? 'DEFAULT';
});

// Non Null

app.inject({
    url: '/non-null',
    method: 'POST',
}).then(res => {
    strictEqual(res.statusCode, 400, 'Expected Bad Request, received ' + res.statusCode);
    deepStrictEqual(res.json(), { statusCode: 400, error: 'Bad Request', message: 'body should be object' });
});

app.inject({
    url: '/non-null',
    method: 'POST',
    payload: { name: 'Oleg' }
}).then(res => {
    strictEqual(res.statusCode, 200, 'Expected OK, received ' + res.statusCode);
    deepStrictEqual(res.payload, 'Oleg');
});

// Nullable

app.inject({
    url: '/nullable',
    method: 'POST',
}).then(res => {
    strictEqual(res.statusCode, 200, 'Expected OK, received ' + res.statusCode);
    deepStrictEqual(res.payload, 'DEFAULT');
});

app.inject({
    url: '/nullable',
    method: 'POST',
    payload: { name: 'Oleg' }
}).then(res => {
    strictEqual(res.statusCode, 200, 'Expected OK, received ' + res.statusCode);
    deepStrictEqual(res.payload, 'Oleg');
});
