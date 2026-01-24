/**
 * Floyd CLI - Pink Floyd Themed Spinners
 *
 * Combines whimsical Pink Floyd thinking messages with appropriate CLI spinners
 * from cli-spinners package + custom Floyd-themed ASCII animations
 *
 * @module utils/floyd-spinners
 */

import cliSpinners from 'cli-spinners';

// ============================================================================
// CUSTOM PINK FLOYD SPINNERS
// ============================================================================

export const customFloydSpinners = {
	/** Moon phases (Dark Side of the Moon) */
	floydMoon: {
		interval: 120,
		frames: ['🌑  ', '🌒  ', '🌓  ', '🌔  ', '🌕  ', '🌖  ', '🌗  ', '🌘  '],
	},

	/** Dark Side prism light refraction */
	floydPrism: {
		interval: 100,
		frames: [
			'    △    ',
			'   ◹◺   ',
			'  ◸◿◹◺  ',
			' ◿🌈◿ ',
			'  ◺◹◸◹  ',
			'   ◺◹   ',
			'    ▽    ',
		],
	},

	/** The Wall being built brick by brick */
	floydWall: {
		interval: 150,
		frames: ['     ', ' ▓   ', ' ▓▓  ', ' ▓▓▓ ', '▓▓▓▓ ', '▓▓▓▓▓'],
	},

	/** Flying pig (Animals album) */
	floydPig: {
		interval: 200,
		frames: ['    🐷    ', '   🐷🐷   ', '  🐷🐷🐷  ', '   🐷🐷   ', '    🐷    '],
	},

	/** Atom heart symbol (Atom Heart Mother) */
	floydAtom: {
		interval: 80,
		frames: ['  ◉  ', ' ◈◈ ', '◇◇◇', ' ◈◈ ', '  ◉  '],
	},

	/** Bike wheel spinning (Bike song) */
	floydBike: {
		interval: 70,
		frames: ['─╼─', '╀─╼', '╼─╀', '─╼─'],
	},

	/** Flying saucer (Saucerful of Secrets) */
	floydSaucer: {
		interval: 100,
		frames: ['   🛸   ', '  🛸✨  ', ' 🛸✨✨ ', '  🛸✨  ', '   🛸   '],
	},

	/** Rainbow refraction (DSOTM cover) */
	floydRainbow: {
		interval: 120,
		frames: ['░░▓▓░░', '░▓██▓░', '▓████▓', '▓██▓▓', '▓▓░░▓▓'],
	},

	/** Hammer (The Wall - "Another Brick in the Wall") */
	floydHammer: {
		interval: 100,
		frames: ['🔨    ', '  🔨  ', '    🔨', '  🔨  '],
	},

	/** Diamond sparkle (Shine On You Crazy Diamond) */
	floydDiamond: {
		interval: 90,
		frames: ['  ◇  ', ' ◈◈ ', '💎✨', ' ◈◈ ', '  ◇  '],
	},

	/** Flower power (Summer '68) */
	floydFlower: {
		interval: 150,
		frames: ['✿    ', ' ✿   ', '  ✿  ', '   ✿ ', '    ✿', '   ✿ ', '  ✿  ', ' ✿   '],
	},

	/** Sun rising/setting (Set the Controls for the Heart of the Sun) */
	floydSun: {
		interval: 100,
		frames: ['🌅    ', ' 🌅   ', '  🌅  ', ' 🌞  ', '  🌅  ', ' 🌅   ', '🌅    '],
	},

	/** Ocean waves (Echoes, One of These Days) */
	floydWave: {
		interval: 120,
		frames: ['〜〜〜', ' 〜〜〜', '〜〜〜 ', ' 〜〜〜'],
	},

	/** Clouds parting (Obscured by Clouds, Goodbye Blue Sky) */
	floydClouds: {
		interval: 150,
		frames: ['☁️☁️☁️', '☁️☁️ 🌤️', '☁️  ⛅️', ' 🌤️    ', '⛅️  ☁️', '🌤️ ☁️☁️'],
	},

	/** Light turning on (Let There Be More Light) */
	floydLight: {
		interval: 80,
		frames: ['💡   ', '💡✨ ', ' 💡✨', '  💡 ', '   💡'],
	},

	/** Rocket launching (Interstellar Overdrive) */
	floydRocket: {
		interval: 100,
		frames: ['  🚀  ', ' 🚀💫', '🚀💫✨', ' 🚀💫', '  🚀  '],
	},

	/** Eye blinking (See Emily Play) */
	floydEye: {
		interval: 200,
		frames: ['👁️   ', ' 👁️  ', '  👁️ ', '   👁️', '  👁️ ', ' 👁️  '],
	},

	/** Fire flames (Set the Controls for the Heart of the Sun, Flaming) */
	floydFire: {
		interval: 90,
		frames: ['🔥   ', ' 🔥🔥', '🔥🔥🔥', ' 🔥🔥', '🔥   '],
	},
};

// ============================================================================
// PINK FLOYD THINKING MESSAGES
// ============================================================================

export const floydThinkingMessages = [
	// The Dark Side of the Moon
	'🌙 Painting brilliant colors on the dark side of the moon...',
	'⏰ Time is ticking away, waiting for the answer to emerge...',
	'💰 Money: it\'s a gas, processing your request...',
	'🎵 Listening to the great gig in the sky, gathering thoughts...',
	'⚡ Us and them: finding the middle ground in your code...',
	'🧠 Brain damage: the lunatic is on the grass, computing...',
	'🌈 Breathe, breathe in the air... processing deeply...',
	'🔊 On the run: chasing down the solution...',

	// Wish You Were Here
	'🎸 Wish you were here... but the model\'s still thinking...',
	'🔥 Welcome to the machine: computing your request...',
	'🌊 Have a cigar: rolling the solution into shape...',
	'💎 Shine on you crazy diamond: polishing the response...',
	'🌧️ Wading through the waters of ambiguity...',
	'🔥 Burning through the complexity, just like the sun...',

	// The Wall
	'🧱 Another brick in the wall: building your solution layer by layer...',
	'😮 Comfortably numb: waiting for the feeling to return...',
	'🎻 Hey you: out there in the cold, getting an answer...',
	'👶 Is there anybody out there? Checking the data stream...',
	'🎸 Run like hell: racing through the possibilities...',
	'🌙 Goodbye blue sky: clearing the fog of uncertainty...',
	'🏠 Empty spaces: filling in the blanks...',
	'🎵 Young lust: eager to respond, just processing...',

	// Animals
	'🐷 Pigs on the wing: flying through the data...',
	'🐑 Sheep: safely herding the bits and bytes...',
	'🐕 Dogs: guarding against errors in the response...',

	// Atom Heart Mother
	'🎺 Atom heart mother: synthesize-ing the solution...',
	'🌬️ If: contemplating the possibilities...',
	'🌻 Summer \'68: grooving through the computation...',
	'🎵 Fat old sun: warming up the algorithm...',

	// Meddle & Obscured by Clouds
	'🌊 One of these days: getting to the answer...',
	'🔁 Echoes: bouncing ideas off the digital canyon...',
	'🎹 Fearless: boldly computing where no code has computed before...',
	'☁️ Obscured by clouds: clearing up the confusion...',
	'🌧️ When you\'re in: deep in the thought process...',
	'🎸 Childhood\'s end: maturing the response...',

	// Piper at the Gates of Dawn
	'🌟 Astronomy domine: calculating celestial solutions...',
	'🔥 Lucifer sam: prowling through the codebase...',
	'🚀 Interstellar overdrive: engaging faster-than-light processing...',
	'👁️ See emily play: envisioning the perfect response...',
	'🐁 Matilda mother: nurturing the solution...',
	'🌙 Flaming: setting ideas ablaze...',
	'🚂 Bike: riding through the data landscape...',

	// Saucerful of Secrets & More
	'🛸 Set the controls for the heart of the sun: navigating deep space...',
	'🌀 Let there be more light: illuminating the answer...',
	'💀 Corporal clegg: marching towards the solution...',
	'🎵 Careful with that axe, Eugene: handling delicate operations...',
	'🌊 Several species: complex synthesis in progress...',
	'🌑 The narrow way: finding the path through...',
	'🎸 Sysyphus: rolling the boulder of knowledge uphill...',

	// General Vibes
	'🎸 In the studio: mixing the perfect response...',
	'🎧 Roger Waters is reviewing your request...',
	'🎹 David Gilmour is carefully crafting the solo...',
	'🎵 Rick Wright is adding the atmospheric layers...',
	'🥁 Nick Mason is keeping the perfect rhythm...',
	'🔺 Syd Barrett is seeing something you\'re not...',
	'🎨 Storm Thorgerson is designing the response cover...',
	'🎧 Alan Parsons is engineering the perfect mix...',
	'📼 The tape is spinning: recording your answer...',
	'💡 The lunatic is in the hall: having a breakthrough idea...',
	'🌙 Keep talking: the conversation continues...',
	'⚡ Coming back to life: resurrecting the perfect response...',

	// Short & Punchy
	'🌙 Thinking on the dark side...',
	'🧱 Building another brick...',
	'💎 Shining on...',
	'⏰ Ticking away...',
	'🐑 Herding the bits...',
	'🌈 Painting colors...',
	'🔥 Burning bright...',
	'🚀 Interstellar processing...',
	'🎸 Sustain note: holding the thought...',
	'🌊 Echoes: response in progress...',
	'⚡ Flashback: retrieving the answer...',
	'🌟 Astronomy: calculating celestial solutions...',
];

// ============================================================================
// MESSAGE → SPINNER MAPPING
// ============================================================================

export const floydSpinnerMapping: Record<string, keyof typeof cliSpinners | keyof typeof customFloydSpinners> = {
	// Dark Side of the Moon
	'🌙 Painting brilliant colors on the dark side of the moon...': 'moon',
	'⏰ Time is ticking away, waiting for the answer to emerge...': 'clock',
	'💰 Money: it\'s a gas, processing your request...': 'bounce',
	'🎵 Listening to the great gig in the sky, gathering thoughts...': 'star',
	'⚡ Us and them: finding the middle ground in your code...': 'toggle',
	'🧠 Brain damage: the lunatic is on the grass, computing...': 'dots',
	'🌈 Breathe, breathe in the air... processing deeply...': 'growVertical',
	'🔊 On the run: chasing down the solution...': 'runner',

	// Wish You Were Here
	'🎸 Wish you were here... but the model\'s still thinking...': 'earth',
	'🔥 Welcome to the machine: computing your request...': 'material',
	'🌊 Have a cigar: rolling the solution into shape...': 'balloon',
	'💎 Shine on you crazy diamond: polishing the response...': 'star2',
	'🌧️ Wading through the waters of ambiguity...': 'weather',
	'🔥 Burning through the complexity, just like the sun...': 'orangePulse',

	// The Wall
	'🧱 Another brick in the wall: building your solution layer by layer...': 'layer',
	'😮 Comfortably numb: waiting for the feeling to return...': 'mindblown',
	'🎻 Hey you: out there in the cold, getting an answer...': 'shark',
	'👶 Is there anybody out there? Checking the data stream...': 'pong',
	'🎸 Run like hell: racing through the possibilities...': 'arrow2',
	'🌙 Goodbye blue sky: clearing the fog of uncertainty...': 'weather',
	'🏠 Empty spaces: filling in the blanks...': 'boxBounce',
	'🎵 Young lust: eager to respond, just processing...': 'hearts',

	// Animals
	'🐷 Pigs on the wing: flying through the data...': 'aesthetic',
	'🐑 Sheep: safely herding the bits and bytes...': 'dots12',
	'🐕 Dogs: guarding against errors in the response...': 'toggle3',

	// Atom Heart Mother
	'🎺 Atom heart mother: synthesize-ing the solution...': 'betaWave',
	'🌬️ If: contemplating the possibilities...': 'arc',
	'🌻 Summer \'68: grooving through the computation...': 'floydFlower',
	'🎵 Fat old sun: warming up the algorithm...': 'floydSun',

	// Meddle & Obscured
	'🌊 One of these days: getting to the answer...': 'floydWave',
	'🔁 Echoes: bouncing ideas off the digital canyon...': 'bouncingBall',
	'🎹 Fearless: boldly computing where no code has computed before...': 'arrow',
	'☁️ Obscured by clouds: clearing up the confusion...': 'floydClouds',
	'🌧️ When you\'re in: deep in the thought process...': 'growVertical',
	'🎸 Childhood\'s end: maturing the response...': 'sand',

	// Piper at the Gates of Dawn
	'🌟 Astronomy domine: calculating celestial solutions...': 'star',
	'🔥 Lucifer sam: prowling through the codebase...': 'shark',
	'🚀 Interstellar overdrive: engaging faster-than-light processing...': 'floydRocket',
	'👁️ See emily play: envisioning the perfect response...': 'floydEye',
	'🐁 Matilda mother: nurturing the solution...': 'dots2',
	'🌙 Flaming: setting ideas ablaze...': 'floydFire',
	'🚂 Bike: riding through the data landscape...': 'floydBike',

	// Saucerful of Secrets
	'🛸 Set the controls for the heart of the sun: navigating deep space...': 'floydSaucer',
	'🌀 Let there be more light: illuminating the answer...': 'floydLight',
	'💀 Corporal clegg: marching towards the solution...': 'line',
	'🎵 Careful with that axe, Eugene: handling delicate operations...': 'hamburger',
	'🌊 Several species: complex synthesis in progress...': 'noise',
	'🌑 The narrow way: finding the path through...': 'pipe',
	'🎸 Sysyphus: rolling the boulder of knowledge uphill...': 'bouncingBar',

	// General Vibes
	'🎸 In the studio: mixing the perfect response...': 'speaker',
	'🎧 Roger Waters is reviewing your request...': 'fistBump',
	'🎹 David Gilmour is carefully crafting the solo...': 'fingerDance',
	'🎵 Rick Wright is adding the atmospheric layers...': 'aesthetic',
	'🥁 Nick Mason is keeping the perfect rhythm...': 'point',
	'🔺 Syd Barrett is seeing something you\'re not...': 'floydRainbow',
	'🎨 Storm Thorgerson is designing the response cover...': 'squareCorners',
	'🎧 Alan Parsons is engineering the perfect mix...': 'orangeBluePulse',
	'📼 The tape is spinning: recording your answer...': 'toggle13',
	'💡 The lunatic is in the hall: having a breakthrough idea...': 'toggle7',
	'🌙 Keep talking: the conversation continues...': 'dqpb',
	'⚡ Coming back to life: resurrecting the perfect response...': 'christmas',

	// Short & Punchy (fallbacks)
	'🌙 Thinking on the dark side...': 'dots',
	'🧱 Building another brick...': 'growHorizontal',
	'💎 Shining on...': 'star',
	'⏰ Ticking away...': 'timeTravel',
	'🐑 Herding the bits...': 'dots8Bit',
	'🌈 Painting colors...': 'floydPrism',
	'🔥 Burning bright...': 'grenade',
	'🚀 Interstellar processing...': 'arc',
	'🎸 Sustain note: holding the thought...': 'toggle2',
	'🌊 Echoes: response in progress...': 'circle',
	'⚡ Flashback: retrieving the answer...': 'flip',
	'🌟 Astronomy: calculating celestial solutions...': 'circleQuarters',
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get a random Pink Floyd thinking message
 */
export function getRandomFloydMessage(): string {
	const index = Math.floor(Math.random() * floydThinkingMessages.length);
	return floydThinkingMessages[index];
}

/**
 * Get appropriate spinner for a given message
 * @param message - The thinking message
 * @returns Spinner config (interval + frames)
 */
export function getSpinnerForMessage(message: string): {
	interval: number;
	frames: string[];
} {
	const spinnerKey = floydSpinnerMapping[message];

	if (spinnerKey && spinnerKey in cliSpinners) {
		const spinner = cliSpinners[spinnerKey as keyof typeof cliSpinners];
		// Type assertion: cli-spinners objects have interval and frames
		return spinner as { interval: number; frames: string[] };
	}

	if (spinnerKey && spinnerKey in customFloydSpinners) {
		return customFloydSpinners[spinnerKey as keyof typeof customFloydSpinners];
	}

	// Fallback to default dots spinner
	return cliSpinners.dots as { interval: number; frames: string[] };
}

/**
 * Get random message + spinner combo
 */
export function getRandomFloydSpinner(): {
	message: string;
	spinner: {interval: number; frames: string[]};
} {
	const message = getRandomFloydMessage();
	const spinner = getSpinnerForMessage(message);
	return {message, spinner};
}

/**
 * Get all available spinners (built-in + custom)
 */
export function getAllSpinners() {
	return {
		...cliSpinners,
		...customFloydSpinners,
	};
}

// ============================================================================
// TYPES
// ============================================================================

export type FloydSpinnerKey = keyof typeof floydSpinnerMapping;
export type FloydMessage = typeof floydThinkingMessages[number];
