// The kitchen's geometry on the 1280x720 canvas. One place owns every
// rectangle, so the renderer and the input code can never disagree about
// where a button is. All coordinates are canvas pixels.
//
// v2 adds a customer strip across the top: the customers stand behind
// the counter, each under a speech bubble that shows what they ordered.

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;

export const HEADER = { x: 0, y: 0, w: 1280, h: 48 };

// Customers: three slots across the counter's width. Each slot holds one
// customer standing behind the counter, with a speech bubble above them.
export const CUSTOMER_STRIP = { x: 312, y: 48, w: 616, h: 172 };
export const CUSTOMER_SLOTS = 3;
export const CUSTOMER_SLOT_W = 200;
export const CUSTOMER_SLOT_GAP = 8;
// A customer's body is drawn in this box inside their slot.
export const CUSTOMER_BODY = { w: 120, h: 78 };
// The speech bubble floats above the customer's head.
export const BUBBLE = { w: 168, h: 58 };

// Main area starts below the customer strip.
export const MAIN_Y = 232;
export const MAIN_H = 488;

// Order board: the left column. Each ticket belongs to one customer.
export const BOARD = { x: 16, y: 232, w: 280, h: 488 };
export const TICKET_HEIGHT = 152;
export const TICKET_GAP = 10;

// Counter: the middle column. Two rows of four ingredient stations.
export const COUNTER = { x: 312, y: 232, w: 616, h: 252 };
export const STATION_COLS = 4;
export const STATION_ROWS = 2;
export const STATION_W = 148;
export const STATION_H = 118;
export const STATION_GAP_X = 8;
export const STATION_GAP_Y = 10;

// The plate lives under the counter, centre column.
export const PLATE_AREA = { x: 312, y: 496, w: 616, h: 208 };
export const PLATE_CENTER = { x: 540, y: 600 };
export const PLATE_RADIUS = 88;
export const SERVE_BUTTON = { x: 700, y: 520, w: 196, h: 60 };
export const CLEAR_BUTTON = { x: 700, y: 592, w: 196, h: 44 };

// Recipe book: the right column.
export const RECIPES = { x: 944, y: 232, w: 320, h: 488 };

// The grade popup (Wonderful! / Excellent! / Good) is centred on the
// whole canvas, over the kitchen.
export const GRADE_POPUP = { x: 640, y: 330, w: 520, h: 150 };
