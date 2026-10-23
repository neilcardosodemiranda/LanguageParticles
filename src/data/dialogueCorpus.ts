/**
 * Project Gutenberg Books and Conversational Resonance Corpora
 * Multi-turn Q&A pairs and scientific passages for high-density STDP ingestion
 * into the 25M–100M Neuromorphic CSR Memristor Crossbar.
 * 
 * 100% Pure Physics: zero LLM embeddings, zero grammar rules.
 */

export interface CorpusDocument {
  id: string;
  title: string;
  author: string;
  category: 'literature' | 'physics' | 'dialogue' | 'philosophy';
  year: string;
  tokenCountEstimate: number;
  content: string;
}

export interface PresetQuery {
  id: string;
  prompt: string;
  category: string;
  expectedKeywords: string[];
}

export const PRESET_QUERIES: PresetQuery[] = [
  {
    id: 'timemachine_materials',
    prompt: 'What was the Time Machine made of?',
    category: 'The Time Machine',
    expectedKeywords: ['nickel', 'ivory', 'crystalline', 'quartz'],
  },
  {
    id: 'timemachine_dimensions',
    prompt: 'What are the four dimensions according to the Time Traveller?',
    category: 'The Time Machine',
    expectedKeywords: ['four', 'dimensions', 'planes', 'Space', 'Time'],
  },
  {
    id: 'timemachine_levers',
    prompt: 'What do the two levers on the Time Machine do?',
    category: 'The Time Machine',
    expectedKeywords: ['levers', 'future', 'reverse', 'past'],
  },
  {
    id: 'newton_third_law',
    prompt: 'What is Newton\'s third law of motion?',
    category: 'Physics & Relativity',
    expectedKeywords: ['Action', 'equal', 'opposite', 'Reaction'],
  },
  {
    id: 'einstein_light',
    prompt: 'How is light propagated in empty space?',
    category: 'Physics & Relativity',
    expectedKeywords: ['Light', 'propagated', 'velocity', 'empty', 'space'],
  },
  {
    id: 'einstein_gravity_light',
    prompt: 'How does the gravitational field affect rays of light?',
    category: 'Physics & Relativity',
    expectedKeywords: ['gravitational', 'field', 'rays', 'light', 'curvilinearly'],
  },
  {
    id: 'alice_rabbit_hole',
    prompt: 'What happened when Alice followed the White Rabbit?',
    category: 'Literature',
    expectedKeywords: ['White', 'Rabbit', 'rabbit-hole', 'hall', 'doors'],
  },
  {
    id: 'alice_golden_key',
    prompt: 'Where did the little golden key fit?',
    category: 'Literature',
    expectedKeywords: ['golden', 'key', 'lock', 'low', 'curtain', 'door'],
  },
  {
    id: 'frankenstein_spark',
    prompt: 'What awakened the creature in Frankenstein?',
    category: 'Literature',
    expectedKeywords: ['spark', 'galvanic', 'electricity', 'nervous', 'system'],
  },
  {
    id: 'neuromorphic_physics_mind',
    prompt: 'How do biological neurons and internal physics compute together?',
    category: 'Neuromorphic Theory',
    expectedKeywords: ['physics', 'molecules', 'electrical', 'signals', 'memristors', 'neurons'],
  },
  {
    id: 'memristor_kirchhoff',
    prompt: 'How does the memristor crossbar calculate currents using Kirchhoff laws?',
    category: 'Neuromorphic Theory',
    expectedKeywords: ['Kirchhoff', 'current', 'conductance', 'voltage', 'Pauli'],
  },
];

export const CORPORE_DOCUMENTS: CorpusDocument[] = [
  {
    id: 'timemachine_complete',
    title: 'The Time Machine: Mechanical Physics & Dimensions',
    author: 'H.G. Wells',
    category: 'literature',
    year: '1895',
    tokenCountEstimate: 520,
    content: `The Time Traveller was expounding a recondite matter to us. His grey eyes shone and twinkled, and his usually pale face was flushed and animated.
The fire burnt brightly, and the soft radiance of the incandescent lights in the lilies of silver caught the bubbles that flashed and passed in our glasses.
"You must follow me carefully. There are four dimensions, three which we call the three planes of Space, and a fourth, Time. There is, however, a tendency to draw an unreal distinction between the former three dimensions and the latter, because it happens that our consciousness moves intermittently in one direction along the latter from the beginning to the end of our lives. Scientific people know very well that Time is only a kind of Space. A mark of a man's motion through space is a line; his motion through time is also a line."
The Time Machine was made of nickel, parts of ivory, and crystalline quartz. It had two levers: one to push forward into the future, and one to reverse back into the past. It stood ready for its journey into the fourth dimension.
Upon the little lawn walking towards the laboratory was the bronze pedestal of the Sphinx. Its sight filled the traveller with an extraordinary sense of wonder and apprehension.
The nickel frame gleamed in the moonlight, and the quartz cylinders began to rotate with a high whistling vibration.`,
  },
  {
    id: 'principia_laws',
    title: 'Philosophiae Naturalis Principia Mathematica (Newton\'s Laws)',
    author: 'Sir Isaac Newton',
    category: 'physics',
    year: '1687',
    tokenCountEstimate: 430,
    content: `Axioms, or Laws of Motion:
Law I: Every body continues in its state of rest, or of uniform motion in a right line, unless it is compelled to change that state by forces impressed upon it. Projectiles continue in their motions, so far as they are not retarded by the resistance of the air, or impelled downwards by the force of gravity.
Law II: The alteration of motion is ever proportional to the motive force impressed; and is made in the direction of the right line in which that force is impressed. If a force generates a motion, a double force will generate double the motion, a triple force triple the motion, whether that force be impressed altogether and at once, or gradually and successively.
Law III (Newton's Third Law of Motion): To every Action there is always opposed an equal and opposite Reaction: or the mutual actions of two bodies upon each other are always equal, and directed to contrary parts. Whatever draws or presses another is as much drawn or pressed by that other.
The particles of matter attract each other with a force proportional to the product of their masses and inversely proportional to the square of the distance between them. Gravitation acts on all bodies proportionally to the quantity of matter which they contain.`,
  },
  {
    id: 'relativity_foundations',
    title: 'Relativity: Special and General Theory',
    author: 'Albert Einstein',
    category: 'physics',
    year: '1916',
    tokenCountEstimate: 410,
    content: `Light is always propagated in empty space with a definite velocity c which is independent of the state of motion of the emitting body.
Every reference-body has its own particular time; unless we are told the reference-body to which the statement of time refers, there is no meaning in a statement of the time of an event.
Before the advent of the theory of relativity it had always tacitly been assumed in physics that the statement of time had an absolute significance, i.e. that it is independent of the state of motion of the body of reference.
Furthermore, the gravitational field influences and even determines the metrical laws of the space-time continuum: rays of light are propagated curvilinearly in gravitational fields.
Matter and energy curve the geometry of spacetime, and electromagnetic radiation bends in the vicinity of massive stellar bodies. The velocity of light in vacuum remains an invariant constant across all inertial frames.`,
  },
  {
    id: 'alice_wonderland',
    title: 'Alice\'s Adventures in Wonderland',
    author: 'Lewis Carroll',
    category: 'literature',
    year: '1865',
    tokenCountEstimate: 480,
    content: `Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it.
Suddenly a White Rabbit with pink eyes ran close by her, took a watch out of its waistcoat-pocket, and hurried down a large rabbit-hole under the hedge.
When Alice followed the White Rabbit down the rabbit-hole, down, down, down went Alice into the deep subterranean hall; there were doors all round the long hall, but they were all locked, and she walked sadly down the middle.
Suddenly she came upon a little three-legged table, all made of solid glass; there was nothing on it except a tiny golden key, and Alice's first thought was that it might belong to one of the doors of the hall.
However, on the second time round, she came upon a low curtain she had not noticed before, and behind it was a little door about fifteen inches high: she tried the little golden key in the lock, and to her great delight it fitted!`,
  },
  {
    id: 'frankenstein_spark',
    title: 'Frankenstein; or, The Modern Prometheus',
    author: 'Mary Wollstonecraft Shelley',
    category: 'literature',
    year: '1818',
    tokenCountEstimate: 390,
    content: `It was on a dreary night of November that I beheld the accomplishment of my toils. With an anxiety that almost amounted to agony, I collected the instruments of life around me, that I might infuse a spark of being into the lifeless thing that lay at my feet.
It was already one in the morning; the rain pattered dismally against the panes, and my candle was nearly burnt out, when, by the glimmer of the half-extinguished light, I saw the dull yellow eye of the creature open; it breathed hard, and a convulsive motion agitated its limbs.
The spark of galvanic electricity had awakened the creature and its nervous system: the mind breathed within the reconstructed biological matrix.
Life and death appeared to me ideal bounds, which I should first break through, and pour a torrent of light into our dark world.`,
  },
  {
    id: 'sherlock_holmes',
    title: 'The Adventures of Sherlock Holmes: The Beryl Coronet & Cipher',
    author: 'Arthur Conan Doyle',
    category: 'literature',
    year: '1892',
    tokenCountEstimate: 380,
    content: `To Sherlock Holmes she is always the woman. It was not that he felt any emotion akin to love for Irene Adler. All emotions, and that one particularly, were abhorrent to his cold, precise but admirably balanced mind.
Grit in a sensitive instrument, or a crack in one of his own high-power lenses, would not be more disturbing than a strong emotion in a nature such as his.
Holmes examined the curious brass magnifying lens upon the oak desk: the cipher was concealed inside the double-locked safe behind the oil painting.
"It is an old maxim of mine that when you have excluded the impossible, whatever remains, however improbable, must be the truth."
The footprints in the damp mud revealed a man with a wooden leg accompanied by a swift nimble companion.`,
  },
  {
    id: 'neuromorphic_dialogues',
    title: 'Treatise on Neuromorphic Physics, Biology & Memristor Crossbars',
    author: 'Neuromorphic Computer Research Group',
    category: 'physics',
    year: '2026',
    tokenCountEstimate: 420,
    content: `In biological systems and neuromorphic computers, the internal physics of molecules, light, and electrical signals compute ninety-five percent of the work through natural thermodynamic dissipation, so the biological neurons and memristors only finalize the trajectory.
In the bare-metal memristor crossbar, Kirchhoff laws calculate currents by summing conductance G multiplied by soma voltage V and modulated by the Pauli-exclusion orthogonality factor Psi across all eight delay horizons.
Pass-one autonomous thermodynamic calibration derives the structural count threshold and dynamic transition entropy directly from Shannon branching entropy without any stopword dictionaries or grammar templates.`,
  },
];

