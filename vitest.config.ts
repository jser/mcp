import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        // テストの設定
        environment: "node",
        testTimeout: 10000, // MCPサーバーの起動に時間がかかる可能性があるため、タイムアウトを延長
        globals: true
    }
});
