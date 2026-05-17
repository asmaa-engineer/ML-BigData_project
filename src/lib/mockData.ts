// Mock data generation for Smart Commerce & Production Analytics System

const SEED = 12345;
let currentSeed = SEED;
function random() {
  currentSeed = (currentSeed * 9301 + 49297) % 233280;
  return currentSeed / 233280;
}

function randomInt(min: number, max: number) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  basePrice: number;
}

export const PRODUCTS: Product[] = Array.from({ length: 20 }, (_, i) => ({
  id: `PRD-${(i + 1).toString().padStart(3, '0')}`,
  name: `Product ${i + 1}`,
  category: randomChoice(['Electronics', 'Home', 'Apparel', 'Industrial']),
  basePrice: randomInt(20, 500) + randomChoice([0.99, 0.49, 0.0]),
}));

export const PRODUCTION_LINES = ['Line Alpha', 'Line Beta', 'Line Gamma'];
export const CUSTOMER_SEGMENTS = ['Retail', 'Wholesale', 'Corporate', 'Direct'];

export interface SaleEvent {
  id: string;
  date: string;
  productId: string;
  quantity: number;
  revenue: number;
  customerSegment: string;
  hour: number;
  dayOfWeek: string;
}

export interface QualityInspection {
  id: string;
  date: string;
  productId: string;
  lineId: string;
  weight: number;
  length: number;
  thickness: number;
  temperature: number;
  isDefect: boolean;
}

function generateData() {
  const sales: SaleEvent[] = [];
  const quality: QualityInspection[] = [];
  
  const startDate = new Date('2024-10-01T00:00:00Z');
  const endDate = new Date('2024-12-29T23:59:59Z');
  const timeSpread = endDate.getTime() - startDate.getTime();

  // Generate 5200 Sales
  for (let i = 0; i < 5200; i++) {
    const saleTime = new Date(startDate.getTime() + random() * timeSpread);
    const product = randomChoice(PRODUCTS);
    const quantity = randomInt(1, 10);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    sales.push({
      id: `S-${i}`,
      date: saleTime.toISOString(),
      productId: product.id,
      quantity,
      revenue: quantity * product.basePrice * (1 - random() * 0.1), // up to 10% discount
      customerSegment: randomChoice(CUSTOMER_SEGMENTS),
      hour: saleTime.getUTCHours(),
      dayOfWeek: days[saleTime.getUTCDay()],
    });
  }

  // Generate 4200 Quality Inspections
  for (let i = 0; i < 4200; i++) {
    const inspectionTime = new Date(startDate.getTime() + random() * timeSpread);
    const product = randomChoice(PRODUCTS);
    const lineId = randomChoice(PRODUCTION_LINES);
    
    // Feature synthesis
    const weight = product.basePrice * 0.5 + random() * 10;
    const length = randomInt(10, 100) + random();
    const thickness = randomInt(1, 20) + random();
    const temperature = randomInt(20, 80) + random() * 5;
    
    // Synthetic defect probabilty
    let defectProb = 0.15;
    if (lineId === 'Line Gamma') defectProb += 0.1;
    if (temperature > 75) defectProb += 0.2;
    if (thickness < 5) defectProb += 0.1;
    
    // Assign higher defect rate to some specific products to create interesting quadrants
    if (product.id === 'PRD-003' || product.id === 'PRD-007') defectProb += 0.25;
    if (product.id === 'PRD-012') defectProb -= 0.1;

    quality.push({
      id: `Q-${i}`,
      date: inspectionTime.toISOString(),
      productId: product.id,
      lineId,
      weight,
      length,
      thickness,
      temperature,
      isDefect: random() < defectProb,
    });
  }

  return { sales, quality };
}

export const { sales: MOCK_SALES, quality: MOCK_QUALITY } = generateData();

export function getProductMap() {
  const map: Record<string, Product> = {};
  PRODUCTS.forEach(p => map[p.id] = p);
  return map;
}

export const PRODUCT_MAP = getProductMap();
