/**
 * Message Queue - Floyd Wrapper
 *
 * Prevents race conditions from rapid message sends
 * Ensures messages are processed FIFO (first in, first out)
 *
 * @typedef {function(string): Promise<void>} MessageCallback
 */

export class MessageQueue {
	constructor() {
		/** @type {Array<{message: string, callback: MessageCallback}>} */
		this.queue = [];
		/** @type {boolean} */
		this.isProcessing = false;
	}

	/**
	 * Add a message to the queue
	 * @param {string} message - The message to process
	 * @param {MessageCallback} callback - Async callback to process the message
	 */
	enqueue(message, callback) {
		this.queue.push({ message, callback });
		this.process();
	}

	/**
	 * Process the next message in queue
	 * @returns {Promise<void>}
	 */
	async process() {
		// If already processing or queue is empty, return
		if (this.isProcessing || this.queue.length === 0) {
			return;
		}

		this.isProcessing = true;

		// Get next message
		const { message, callback } = this.queue.shift();

		try {
			// Execute the callback (process the message)
			await callback(message);
		} catch (error) {
			console.error('Message processing failed:', error);
		} finally {
			this.isProcessing = false;

			// Process next message if any
			if (this.queue.length > 0) {
				this.process();
			}
		}
	}

	/**
	 * Check if queue is empty
	 * @returns {boolean}
	 */
	isEmpty() {
		return this.queue.length === 0;
	}

	/**
	 * Get queue length
	 * @returns {number}
	 */
	getLength() {
		return this.queue.length;
	}

	/**
	 * Clear the queue
	 * @returns {void}
	 */
	clear() {
		this.queue = [];
		this.isProcessing = false;
	}

	/**
	 * Wait for queue to finish processing all messages
	 * @returns {Promise<void>}
	 */
	async waitForQueue() {
		while (!this.isEmpty() || this.isProcessing) {
			// Wait 10ms before checking again
			await new Promise(resolve => setTimeout(resolve, 10));
		}
	}
}

// Singleton instance
/** @type {MessageQueue | null} */
let queueInstance = null;

/**
 * Get the singleton MessageQueue instance
 * @returns {MessageQueue}
 */
export function getMessageQueue() {
	if (!queueInstance) {
		queueInstance = new MessageQueue();
	}
	return queueInstance;
}
