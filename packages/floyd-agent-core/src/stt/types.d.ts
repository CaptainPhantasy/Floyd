// Type declarations for node-record-lpcm16
declare module 'node-record-lpcm16' {
    interface RecordOptions {
        sampleRate?: number;
        channels?: number;
        threshold?: number;
        silence?: string;
        recorder?: string;
        endOnSilence?: boolean;
    }

    interface Record {
        stream(): NodeJS.ReadableStream;
        stop(): void;
    }

    function record(options?: RecordOptions): Record;

    export = record;
}
