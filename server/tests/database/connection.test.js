import { jest } from '@jest/globals';

describe("Database Connection", () => {
    it("should call mongoose.connect and log success", async () => {
        const mongoose = {
            connect: jest.fn().mockResolvedValue({ connection: "mockConnection" }),
            set: jest.fn()
        };

        jest.unstable_mockModule("mongoose", () => ({
            default: mongoose,
        }));

        const { connect } = await import("../../database/connection.js");

        const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => { });

        await connect();

        expect(mongoose.set).toHaveBeenCalledWith("strictQuery", true);
        expect(mongoose.connect).toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith("DATABASE CONNECTED");

        consoleSpy.mockRestore();
    });
});
