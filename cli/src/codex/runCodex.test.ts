import { afterEach, describe, expect, it, vi } from 'vitest';

const harness = vi.hoisted(() => ({
    rpcHandlers: new Map<string, (payload: unknown) => Promise<unknown> | unknown>(),
    appliedConfig: undefined as unknown,
    setModels: [] as Array<string | null>
}));

vi.mock('@/utils/invokedCwd', () => ({
    getInvokedCwd: () => '/tmp/hapi-codex-test'
}));

vi.mock('@/agent/sessionFactory', () => ({
    bootstrapSession: async () => ({
        api: {},
        session: {
            rpcHandlerManager: {
                registerHandler(method: string, handler: (payload: unknown) => Promise<unknown> | unknown) {
                    harness.rpcHandlers.set(method, handler);
                }
            },
            onUserMessage: () => {}
        }
    })
}));

vi.mock('@/agent/runnerLifecycle', () => ({
    createModeChangeHandler: () => () => {},
    createRunnerLifecycle: () => ({
        registerProcessHandlers: () => {},
        cleanupAndExit: async () => {},
        markCrash: () => {},
        setExitCode: () => {},
        setArchiveReason: () => {}
    }),
    setControlledByUser: () => {}
}));

vi.mock('@/claude/registerKillSessionHandler', () => ({
    registerKillSessionHandler: () => {}
}));

vi.mock('./loop', () => ({
    loop: async (opts: {
        onSessionReady?: (session: {
            getModel: () => string | null | undefined;
            getModelReasoningEffort: () => string | null | undefined;
            setPermissionMode: (mode: string) => void;
            setModel: (model: string | null) => void;
            setModelReasoningEffort: (effort: string | null) => void;
            setCollaborationMode: (mode: string) => void;
        }) => void;
    }) => {
        opts.onSessionReady?.({
            getModel: () => 'gpt-5.4',
            getModelReasoningEffort: () => undefined,
            setPermissionMode: () => {},
            setModel: (model) => {
                harness.setModels.push(model);
            },
            setModelReasoningEffort: () => {},
            setCollaborationMode: () => {}
        });

        const handler = harness.rpcHandlers.get('set-session-config');
        if (!handler) {
            throw new Error('set-session-config handler not registered');
        }
        harness.appliedConfig = await handler({ model: 'gpt-5.5' });
    }
}));

import { runCodex } from './runCodex';

describe('runCodex', () => {
    afterEach(() => {
        harness.rpcHandlers.clear();
        harness.appliedConfig = undefined;
        harness.setModels = [];
    });

    it('applies runtime model config to the active Codex session wrapper', async () => {
        await runCodex({});

        expect(harness.appliedConfig).toEqual({
            applied: {
                permissionMode: 'default',
                model: 'gpt-5.5',
                modelReasoningEffort: null,
                collaborationMode: 'default'
            }
        });
        expect(harness.setModels).toEqual([null, 'gpt-5.5']);
    });
});
