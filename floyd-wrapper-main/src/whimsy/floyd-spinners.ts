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
		interval: 80,
		frames: ['🌑  ', '🌒  ', '🌓  ', '🌔  ', '🌕  ', '🌖  ', '🌗  ', '🌘  '],
	},

	/** Dark Side prism light refraction */
	floydPrism: {
		interval: 80,
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
		interval: 100,
		frames: ['     ', ' ▓   ', ' ▓▓  ', ' ▓▓▓ ', '▓▓▓▓ ', '▓▓▓▓▓'],
	},

	/** Flying pig (Animals album) */
	floydPig: {
		interval: 120,
		frames: ['    🐷    ', '   🐷🐷   ', '  🐷🐷🐷  ', '   🐷🐷   ', '    🐷    '],
	},

	/** Atom heart symbol (Atom Heart Mother) */
	floydAtom: {
		interval: 80,
		frames: ['  ◉  ', ' ◈◈ ', '◇◇◇', ' ◈◈ ', '  ◉  '],
	},

	/** Bike wheel spinning (Bike song) */
	floydBike: {
		interval: 80,
		frames: ['─╼─', '╀─╼', '╼─╀', '─╼─'],
	},

	/** Flying saucer (Saucerful of Secrets) */
	floydSaucer: {
		interval: 100,
		frames: ['   🛸   ', '  🛸✨  ', ' 🛸✨✨ ', '  🛸✨  ', '   🛸   '],
	},

	/** Rainbow refraction (DSOTM cover) */
	floydRainbow: {
		interval: 100,
		frames: ['░░▓▓░░', '░▓██▓░', '▓████▓', '▓██▓▓', '▓▓░░▓▓'],
	},

	/** Hammer (The Wall - "Another Brick in the Wall") */
	floydHammer: {
		interval: 100,
		frames: ['🔨    ', '  🔨  ', '    🔨', '  🔨  '],
	},

	/** Diamond sparkle (Shine On You Crazy Diamond) */
	floydDiamond: {
		interval: 100,
		frames: ['  ◇  ', ' ◈◈ ', '💎✨', ' ◈◈ ', '  ◇  '],
	},

	/** Flower power (Summer '68) */
	floydFlower: {
		interval: 120,
		frames: ['✿    ', ' ✿   ', '  ✿  ', '   ✿ ', '    ✿', '   ✿ ', '  ✿  ', ' ✿   '],
	},

	/** Sun rising/setting (Set the Controls for the Heart of the Sun) */
	floydSun: {
		interval: 100,
		frames: ['🌅    ', ' 🌅   ', '  🌅  ', ' 🌞  ', '  🌅  ', ' 🌅   ', '🌅    '],
	},

	/** Ocean waves (Echoes, One of These Days) */
	floydWave: {
		interval: 100,
		frames: ['〜〜〜', ' 〜〜〜', '〜〜〜 ', ' 〜〜〜'],
	},

	/** Clouds parting (Obscured by Clouds, Goodbye Blue Sky) */
	floydClouds: {
		interval: 120,
		frames: ['☁️☁️☁️', '☁️☁️ 🌤️', '☁️  ⛅️', ' 🌤️    ', '⛅️  ☁️', '🌤️ ☁️☁️'],
	},

	/** Light turning on (Let There Be More Light) */
	floydLight: {
		interval: 80,
		frames: ['💡   ', '💡✨ ', ' 💡✨', '  💡 ', '   💡'],
	},

	/** Rocket launching (Interstellar Overdrive) */
	floydRocket: {
		interval: 80,
		frames: ['  🚀  ', ' 🚀💫', '🚀💫✨', ' 🚀💫', '  🚀  '],
	},

	/** Eye blinking (See Emily Play) */
	floydEye: {
		interval: 150,
		frames: ['👁️   ', ' 👁️  ', '  👁️ ', '   👁️', '  👁️ ', ' 👁️  '],
	},

	/** Fire flames (Set the Controls for the Heart of the Sun, Flaming) */
	floydFire: {
		interval: 80,
		frames: ['🔥   ', ' 🔥🔥', '🔥🔥🔥', ' 🔥🔥', '🔥   '],
	},
};

// ============================================================================
// PINK FLOYD THINKING MESSAGES
// ============================================================================

export const floydThinkingMessages = [
	// The Dark Side of the Moon
	'🌙 Painting brilliant colors on the dark side of the moon... because your codebase is equally dark and mysterious.',
	'⏰ Time is ticking away... and you\'ve been staring at this bug for 45 minutes. The clock approves of your suffering.',
	'💰 Money: it\'s a gas... unlike this free AI that\'s definitely not calculating how to charge you later.',
	'🎵 Listening to the great gig in the sky... meanwhile Claire Torry\'s still wailing about your function naming.',
	'⚡ Us and them... mostly "them" = your future self who will hate you for this code.',
	'🧠 Brain damage: the lunatic is on the grass... and he\'s the only one who understands your regex.',
	'🌈 Breathe, breathe in the air... or don\'t. This npm dependency will probably deprecate itself anyway.',
	'🔊 On the run: chasing down the solution... and racing against your laptop battery\'s dying wish.',

	// Wish You Were Here
	'🎸 Wish you were here... but honestly the model\'s dissociating and thinking about whether consciousness is real.',
	'🔥 Welcome to the machine... we detected your soul during the onboarding process.',
	'🌊 Have a cigar: rolling the solution into shape... you\'re gonna go far, kid... right into that dependency hell.',
	'💎 Shine on you crazy diamond... Syd would\'ve loved your variable naming convention.',
	'🌧️ Wading through the waters of ambiguity... that\'s just called "reading legacy code," mate.',
	'🔥 Burning through the complexity, just like the sun... unlike your retinas from staring at this terminal.',

	// The Wall
	'🧱 Another brick in the wall... hey! Teacher! Leave those debug logs alone!',
	'😮 Comfortably numb... that\'s just 4 hours of JavaScript talking.',
	'🎻 Hey you: out there in the cold... can you feel your toes? No? It\'s the TypeScript errors.',
	'👶 Is there anybody out there? ... Just static. The WebSocket connection died alone.',
	'🎸 Run like hell... if you see another `npm install` coming, just go.',
	'🌙 Goodbye blue sky... hello endless `console.log` despair.',
	'🏠 Empty spaces... and the walls were too strong for that `TODO` comment.',
	'🎵 Young lust: eager to respond... bless your heart for thinking this API call will work.',

	// Animals
	'🐷 Pigs on the wing... at least someone\'s aerodynamic unlike your algorithm\'s Big O notation.',
	'🐑 Sheep: safely herding the bits and bytes... you don\'t know what you\'re doing, do you? Baaa.',
	'🐕 Dogs: guarding against errors... dragged down a ditch... time to die. Just like production after your deploy.',

	// Atom Heart Mother
	'🎺 Atom heart mother: synthesize-ing the solution... with a brass band and choir. Because normal processing is for normal people.',
	'🌬️ If: contemplating the possibilities... if I were a swan, I\'d be gone. But I\'m an AI, so here we are.',
	'🌻 Summer \'68: grooving through the computation... in the summer time. With the windows down.',
	'🎵 Fat old sun: warming up the algorithm... and by "warming up" I mean "making your CPU cry."',

	// Meddle & Obscured by Clouds
	'🌊 One of these days: getting to the answer... I\'m going to cut you into little pieces.',
	'🔁 Echoes: bouncing ideas off the digital canyon... overhead the albatross hangs motionless upon the air.',
	'🎹 Fearless: boldly computing where no code has computed before... and getting soaked in the rain.',
	'☁️ Obscured by clouds: clearing up the confusion... or not. Who knows what\'s really out there?',
	'🌧️ When you\'re in: deep in the thought process... it\'s the night of the iguana.',
	'🎸 Childhood\'s end: maturing the response... you put your gun back in its holster.',

	// Piper at the Gates of Dawn
	'🌟 Astronomy domine: calculating celestial solutions... quadrant of the sky. Everyone knows.',
	'🔥 Lucifer sam: prowling through the codebase... that cat\'s something I can\'t explain.',
	'🚀 Interstellar overdrive: engaging faster-than-light processing... taking vibes to the cosmos.',
	'👁️ See emily play: envisioning the perfect response... with the games she plays.',
	'🐁 Matilda mother: nurturing the solution... she raids the larder. Terrible, really.',
	'🌙 Flaming: setting ideas ablaze... in the treacle. Obviously.',
	'🚂 Bike: riding through the data landscape... you\'re gonna like the machine. It has a basket.',

	// Saucerful of Secrets & More
	'🛸 Set the controls for the heart of the sun: navigating deep space... Jupiter\'s orbit awaits.',
	'🌀 Let there be more light: illuminating the answer... for it is dark. The darkest light.',
	'💀 Corporal clegg: marching towards the solution... with his medals. Such a good lad.',
	'🎵 Careful with that axe, Eugene: handling delicate operations... DON\'T DO IT AGAIN.',
	'🌊 Several species: complex synthesis in progress... scattered like leaves. Beautiful, really.',
	'🌑 The narrow way: finding the path through... following the river. Keep going.',
	'🎸 Sysyphus: rolling the boulder of knowledge uphill... just to watch it roll back down. Classic.',

	// General Vibes
	'🎸 In the studio: mixing the perfect response... Dave just did 47 takes of this function.',
	'🎧 Roger Waters is reviewing your request... and he has NOTES about your code structure.',
	'🎹 David Gilmour is carefully crafting the solo... with one, beautiful, sustain button press. Perfect.',
	'🎵 Rick Wright is adding the atmospheric layers... in 4-part harmony. Underappreciated. Like your error handlers.',
	'🥁 Nick Mason is keeping the perfect rhythm... he\'s the only one who showed up on time. Consistent.',
	'🔺 Syd Barrett is seeing something you\'re not... it\'s beautiful. Probably a bicycle.',
	'🎨 Storm Thorgerson is designing the response cover... no photos allowed. Just vibes.',
	'🎧 Alan Parsons is engineering the perfect mix... unfortunately you\'re on the free tier so it\'s mono.',
	'📼 The tape is spinning: recording your answer... on a 16-track. Analog warmth, baby.',
	'💡 The lunatic is in the hall: having a breakthrough idea... or maybe that\'s just your imposter syndrome.',
	'🌙 Keep talking: the conversation continues... even though we ran out of things to say 20 minutes ago.',
	'⚡ Coming back to life: resurrecting the perfect response... from the Division Bell era. No wait, it\'s fine.',

	// Short & Punchy
	'🌙 Thinking on the dark side... yes, it\'s dark. You\'ve been coding since 2am.',
	'🧱 Building another brick... in the wall of technical debt.',
	'💎 Shining on... you crazy diamond... please document your code.',
	'⏰ Ticking away... your deadline. Mate.',
	'🐑 Herding the bits... like cats. Have you ever tried herding cats? That\'s your bug report.',
	'🌈 Painting colors... all over your terminal output because you forgot `--silent` mode.',
	'🔥 Burning bright... your CPU. Close some tabs.',
	'🚀 Interstellar processing... 🌈 *pink floyd noises* 🌈',
	'🎸 Sustain note: holding the thought... for 17 glorious seconds. Feel it.',
	'🌊 Echoes: response in progress... 23 minutes long. Worth every second.',
	'⚡ Flashback: retrieving the answer... from 1994. A simpler time.',
	'🌟 Astronomy: calculating celestial solutions... the stars align. Your code still breaks though.',
];

// ============================================================================
// MESSAGE → SPINNER MAPPING
// ============================================================================

export const floydSpinnerMapping: Record<string, keyof typeof cliSpinners | keyof typeof customFloydSpinners> = {
	// Dark Side of the Moon
	'🌙 Painting brilliant colors on the dark side of the moon... because your codebase is equally dark and mysterious.': 'moon',
	'⏰ Time is ticking away... and you\'ve been staring at this bug for 45 minutes. The clock approves of your suffering.': 'clock',
	'💰 Money: it\'s a gas... unlike this free AI that\'s definitely not calculating how to charge you later.': 'bounce',
	'🎵 Listening to the great gig in the sky... meanwhile Claire Torry\'s still wailing about your function naming.': 'star',
	'⚡ Us and them... mostly "them" = your future self who will hate you for this code.': 'toggle',
	'🧠 Brain damage: the lunatic is on the grass... and he\'s the only one who understands your regex.': 'dots',
	'🌈 Breathe, breathe in the air... or don\'t. This npm dependency will probably deprecate itself anyway.': 'growVertical',
	'🔊 On the run: chasing down the solution... and racing against your laptop battery\'s dying wish.': 'runner',

	// Wish You Were Here
	'🎸 Wish you were here... but honestly the model\'s dissociating and thinking about whether consciousness is real.': 'earth',
	'🔥 Welcome to the machine... we detected your soul during the onboarding process.': 'material',
	'🌊 Have a cigar: rolling the solution into shape... you\'re gonna go far, kid... right into that dependency hell.': 'balloon',
	'💎 Shine on you crazy diamond... Syd would\'ve loved your variable naming convention.': 'star2',
	'🌧️ Wading through the waters of ambiguity... that\'s just called "reading legacy code," mate.': 'weather',
	'🔥 Burning through the complexity, just like the sun... unlike your retinas from staring at this terminal.': 'orangePulse',

	// The Wall
	'🧱 Another brick in the wall... hey! Teacher! Leave those debug logs alone!': 'layer',
	'😮 Comfortably numb... that\'s just 4 hours of JavaScript talking.': 'mindblown',
	'🎻 Hey you: out there in the cold... can you feel your toes? No? It\'s the TypeScript errors.': 'shark',
	'👶 Is there anybody out there? ... Just static. The WebSocket connection died alone.': 'pong',
	'🎸 Run like hell... if you see another `npm install` coming, just go.': 'arrow2',
	'🌙 Goodbye blue sky... hello endless `console.log` despair.': 'weather',
	'🏠 Empty spaces... and the walls were too strong for that `TODO` comment.': 'boxBounce',
	'🎵 Young lust: eager to respond... bless your heart for thinking this API call will work.': 'hearts',

	// Animals
	'🐷 Pigs on the wing... at least someone\'s aerodynamic unlike your algorithm\'s Big O notation.': 'aesthetic',
	'🐑 Sheep: safely herding the bits and bytes... you don\'t know what you\'re doing, do you? Baaa.': 'dots12',
	'🐕 Dogs: guarding against errors... dragged down a ditch... time to die. Just like production after your deploy.': 'toggle3',

	// Atom Heart Mother
	'🎺 Atom heart mother: synthesize-ing the solution... with a brass band and choir. Because normal processing is for normal people.': 'betaWave',
	'🌬️ If: contemplating the possibilities... if I were a swan, I\'d be gone. But I\'m an AI, so here we are.': 'arc',
	'🌻 Summer \'68: grooving through the computation... in the summer time. With the windows down.': 'floydFlower',
	'🎵 Fat old sun: warming up the algorithm... and by "warming up" I mean "making your CPU cry."': 'floydSun',

	// Meddle & Obscured
	'🌊 One of these days: getting to the answer... I\'m going to cut you into little pieces.': 'floydWave',
	'🔁 Echoes: bouncing ideas off the digital canyon... overhead the albatross hangs motionless upon the air.': 'bouncingBall',
	'🎹 Fearless: boldly computing where no code has computed before... and getting soaked in the rain.': 'arrow',
	'☁️ Obscured by clouds: clearing up the confusion... or not. Who knows what\'s really out there?': 'floydClouds',
	'🌧️ When you\'re in: deep in the thought process... it\'s the night of the iguana.': 'growVertical',
	'🎸 Childhood\'s end: maturing the response... you put your gun back in its holster.': 'sand',

	// Piper at the Gates of Dawn
	'🌟 Astronomy domine: calculating celestial solutions... quadrant of the sky. Everyone knows.': 'star',
	'🔥 Lucifer sam: prowling through the codebase... that cat\'s something I can\'t explain.': 'shark',
	'🚀 Interstellar overdrive: engaging faster-than-light processing... taking vibes to the cosmos.': 'floydRocket',
	'👁️ See emily play: envisioning the perfect response... with the games she plays.': 'floydEye',
	'🐁 Matilda mother: nurturing the solution... she raids the larder. Terrible, really.': 'dots2',
	'🌙 Flaming: setting ideas ablaze... in the treacle. Obviously.': 'floydFire',
	'🚂 Bike: riding through the data landscape... you\'re gonna like the machine. It has a basket.': 'floydBike',

	// Saucerful of Secrets
	'🛸 Set the controls for the heart of the sun: navigating deep space... Jupiter\'s orbit awaits.': 'floydSaucer',
	'🌀 Let there be more light: illuminating the answer... for it is dark. The darkest light.': 'floydLight',
	'💀 Corporal clegg: marching towards the solution... with his medals. Such a good lad.': 'line',
	'🎵 Careful with that axe, Eugene: handling delicate operations... DON\'T DO IT AGAIN.': 'hamburger',
	'🌊 Several species: complex synthesis in progress... scattered like leaves. Beautiful, really.': 'noise',
	'🌑 The narrow way: finding the path through... following the river. Keep going.': 'pipe',
	'🎸 Sysyphus: rolling the boulder of knowledge uphill... just to watch it roll back down. Classic.': 'bouncingBar',

	// General Vibes
	'🎸 In the studio: mixing the perfect response... Dave just did 47 takes of this function.': 'speaker',
	'🎧 Roger Waters is reviewing your request... and he has NOTES about your code structure.': 'fistBump',
	'🎹 David Gilmour is carefully crafting the solo... with one, beautiful, sustain button press. Perfect.': 'fingerDance',
	'🎵 Rick Wright is adding the atmospheric layers... in 4-part harmony. Underappreciated. Like your error handlers.': 'aesthetic',
	'🥁 Nick Mason is keeping the perfect rhythm... he\'s the only one who showed up on time. Consistent.': 'point',
	'🔺 Syd Barrett is seeing something you\'re not... it\'s beautiful. Probably a bicycle.': 'floydRainbow',
	'🎨 Storm Thorgerson is designing the response cover... no photos allowed. Just vibes.': 'squareCorners',
	'🎧 Alan Parsons is engineering the perfect mix... unfortunately you\'re on the free tier so it\'s mono.': 'orangeBluePulse',
	'📼 The tape is spinning: recording your answer... on a 16-track. Analog warmth, baby.': 'toggle13',
	'💡 The lunatic is in the hall: having a breakthrough idea... or maybe that\'s just your imposter syndrome.': 'toggle7',
	'🌙 Keep talking: the conversation continues... even though we ran out of things to say 20 minutes ago.': 'dqpb',
	'⚡ Coming back to life: resurrecting the perfect response... from the Division Bell era. No wait, it\'s fine.': 'christmas',

	// Short & Punchy (fallbacks)
	'🌙 Thinking on the dark side... yes, it\'s dark. You\'ve been coding since 2am.': 'dots',
	'🧱 Building another brick... in the wall of technical debt.': 'growHorizontal',
	'💎 Shining on... you crazy diamond... please document your code.': 'star',
	'⏰ Ticking away... your deadline. Mate.': 'timeTravel',
	'🐑 Herding the bits... like cats. Have you ever tried herding cats? That\'s your bug report.': 'dots8Bit',
	'🌈 Painting colors... all over your terminal output because you forgot `--silent` mode.': 'floydPrism',
	'🔥 Burning bright... your CPU. Close some tabs.': 'grenade',
	'🚀 Interstellar processing... 🌈 *pink floyd noises* 🌈': 'arc',
	'🎸 Sustain note: holding the thought... for 17 glorious seconds. Feel it.': 'toggle2',
	'🌊 Echoes: response in progress... 23 minutes long. Worth every second.': 'circle',
	'⚡ Flashback: retrieving the answer... from 1994. A simpler time.': 'flip',
	'🌟 Astronomy: calculating celestial solutions... the stars align. Your code still breaks though.': 'circleQuarters',
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get a random Pink Floyd thinking message
 * NOTE: Thinking phrases disabled - returns simple message
 */
export function getRandomFloydMessage(): string {
	// Thinking phrases disabled - returning simple message
	return 'Thinking...';

	// Original implementation (disabled):
	// const index = Math.floor(Math.random() * floydThinkingMessages.length);
	// return floydThinkingMessages[index];
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
		const spinner = (cliSpinners as unknown as Record<string, { interval: number; frames: string[] }>)[spinnerKey];
		if (spinner) return spinner;
	}

	if (spinnerKey && spinnerKey in customFloydSpinners) {
		const spinner = customFloydSpinners[spinnerKey as keyof typeof customFloydSpinners];
		if (spinner) return spinner;
	}

	// Fallback to default dots spinner
	return cliSpinners.dots;
}

/**
 * Get random message + spinner combo
 */
export function getRandomFloydSpinner(): {
	message: string;
	spinner: { interval: number; frames: string[] };
} {
	const message = getRandomFloydMessage();
	const spinner = getSpinnerForMessage(message);
	return { message, spinner };
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
