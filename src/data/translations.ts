const productTranslations: Record<string, string[]> = {
  '牛奶': ['milk', 'full cream milk', 'trim milk', 'fresh milk'],
  '鸡蛋': ['eggs', 'free range eggs', 'cage free eggs'],
  '米饭': ['rice', 'jasmine rice', 'basmati rice', 'white rice'],
  '面包': ['bread', 'white bread', 'wholemeal bread', 'toast bread'],
  '鸡胸肉': ['chicken breast', 'skinless chicken breast'],
  '鸡腿': ['chicken drumsticks', 'chicken thighs'],
  '洋葱': ['onion', 'brown onion', 'red onion'],
  '番茄': ['tomato', 'tomatoes', 'fresh tomatoes'],
  '方便面': ['instant noodles', 'noodles', 'ramen'],
  '酱油': ['soy sauce', 'light soy sauce', 'dark soy sauce'],
  '豆腐': ['tofu', 'firm tofu', 'silken tofu'],
  '牛肉': ['beef', 'beef mince', 'beef steak'],
  '猪肉': ['pork', 'pork belly', 'pork mince'],
  '三文鱼': ['salmon', 'fresh salmon', 'atlantic salmon'],
  '苹果': ['apple', 'apples', 'fresh apples'],
  '香蕉': ['banana', 'bananas'],
  '土豆': ['potato', 'potatoes', 'washed potatoes'],
  '胡萝卜': ['carrot', 'carrots'],
  '生菜': ['lettuce', 'iceberg lettuce'],
  '黄油': ['butter', 'salted butter', 'unsalted butter'],
  '奶酪': ['cheese', 'cheddar cheese', 'tasty cheese'],
  '酸奶': ['yoghurt', 'yogurt', 'greek yoghurt'],
  '橄榄油': ['olive oil', 'extra virgin olive oil'],
  '盐': ['salt', 'table salt', 'sea salt'],
  '糖': ['sugar', 'white sugar', 'brown sugar', 'raw sugar'],
  '咖啡': ['coffee', 'instant coffee', 'ground coffee'],
  '茶': ['tea', 'black tea', 'green tea'],
  '可乐': ['coca cola', 'coke', 'cola'],
  '矿泉水': ['water', 'spring water', 'mineral water'],
  '洗手液': ['hand wash', 'hand soap', 'liquid soap'],
  '洗发水': ['shampoo', 'hair shampoo'],
  '沐浴露': ['body wash', 'shower gel'],
  '洗衣液': ['laundry liquid', 'laundry detergent'],
  '纸巾': ['tissues', 'facial tissues', 'paper towels'],
  '卫生纸': ['toilet paper', 'toilet rolls'],
  '橙汁': ['orange juice', 'fresh orange juice'],
  '意大利面': ['pasta', 'spaghetti', 'penne pasta'],
  '番茄酱': ['tomato sauce', 'ketchup'],
  '花生酱': ['peanut butter'],
  '果酱': ['jam', 'strawberry jam', 'fruit spread'],
  '麦片': ['cereal', 'oatmeal', 'rolled oats', 'porridge'],
  '冰淇淋': ['ice cream', 'vanilla ice cream'],
};

const englishToChinese: Record<string, string> = {};
Object.entries(productTranslations).forEach(([cn, enList]) => {
  enList.forEach((en) => {
    englishToChinese[en.toLowerCase()] = cn;
  });
});

export function getSearchKeywords(input: string): string[] {
  const trimmed = input.trim();

  if (trimmed === '') return [];

  // 中文输入 → 英文关键词
  if (/[一-鿿]/.test(trimmed)) {
    const exact = productTranslations[trimmed];
    if (exact) return exact;

    // 模糊匹配中文
    for (const [cn, enList] of Object.entries(productTranslations)) {
      if (cn.includes(trimmed) || trimmed.includes(cn)) {
        return enList;
      }
    }
    return [trimmed];
  }

  // 英文输入 → 直接用原文搜索
  return [trimmed.toLowerCase()];
}

export function getChineseName(englishName: string): string {
  const lower = englishName.toLowerCase();
  for (const [en, cn] of Object.entries(englishToChinese)) {
    if (lower.includes(en) || en.includes(lower)) {
      return cn;
    }
  }
  return '';
}

export { productTranslations };
