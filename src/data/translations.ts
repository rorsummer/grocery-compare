const productTranslations: Record<string, string[]> = {
  // ===== 乳制品 =====
  '牛奶': ['milk', 'full cream milk', 'trim milk', 'fresh milk', 'standard milk'],
  '奶粉': ['milk powder', 'infant formula', 'baby formula', 'skim milk powder', 'whole milk powder', 'toddler milk powder'],
  '酸奶': ['yoghurt', 'yogurt', 'greek yoghurt', 'natural yoghurt', 'flavoured yoghurt'],
  '奶酪': ['cheese', 'cheddar cheese', 'tasty cheese', 'mozzarella cheese', 'parmesan cheese', 'cream cheese'],
  '黄油': ['butter', 'salted butter', 'unsalted butter', 'spreadable butter'],
  '奶油': ['cream', 'fresh cream', 'whipping cream', 'sour cream', 'thickened cream'],

  // ===== 蛋类 =====
  '鸡蛋': ['eggs', 'free range eggs', 'cage free eggs', 'organic eggs', 'dozen eggs'],

  // ===== 主食 =====
  '米饭': ['rice', 'jasmine rice', 'basmati rice', 'white rice', 'brown rice', 'sushi rice'],
  '大米': ['rice', 'jasmine rice', 'basmati rice', 'white rice', 'brown rice', 'long grain rice'],
  '面包': ['bread', 'white bread', 'wholemeal bread', 'toast bread', 'sourdough bread', 'sandwich bread'],
  '面粉': ['flour', 'plain flour', 'self raising flour', 'bread flour', 'wholemeal flour'],
  '意大利面': ['pasta', 'spaghetti', 'penne pasta', 'fettuccine', 'macaroni', 'lasagne'],
  '麦片': ['cereal', 'oatmeal', 'rolled oats', 'porridge', 'muesli', 'granola', 'corn flakes', 'weetbix'],
  '面条': ['noodles', 'egg noodles', 'rice noodles', 'udon noodles', 'hokkien noodles'],

  // ===== 肉类 =====
  '牛肉': ['beef', 'beef mince', 'beef steak', 'beef rump', 'beef sirloin', 'beef roast'],
  '猪肉': ['pork', 'pork belly', 'pork mince', 'pork chops', 'pork roast', 'pork shoulder'],
  '鸡胸肉': ['chicken breast', 'skinless chicken breast', 'chicken breast fillet'],
  '鸡腿': ['chicken drumsticks', 'chicken thighs', 'chicken legs', 'chicken thigh fillet'],
  '鸡肉': ['chicken', 'whole chicken', 'chicken pieces', 'free range chicken'],
  '羊肉': ['lamb', 'lamb chops', 'lamb leg', 'lamb mince', 'lamb shoulder'],
  '培根': ['bacon', 'streaky bacon', 'middle bacon', 'bacon rashers'],
  '香肠': ['sausages', 'beef sausages', 'pork sausages', 'chorizo', 'kransky'],
  '火腿': ['ham', 'sliced ham', 'champagne ham', 'ham on the bone'],
  '午餐肉': ['luncheon meat', 'spam', 'canned ham'],

  // ===== 海鲜 =====
  '三文鱼': ['salmon', 'fresh salmon', 'atlantic salmon', 'smoked salmon', 'salmon fillet'],
  '虾': ['shrimp', 'prawns', 'raw prawns', 'cooked prawns', 'tiger prawns'],
  '鱼': ['fish', 'white fish', 'fish fillet', 'fresh fish', 'snapper', 'tarakihi'],

  // ===== 蔬菜 =====
  '土豆': ['potato', 'potatoes', 'washed potatoes', 'agria potatoes'],
  '胡萝卜': ['carrot', 'carrots', 'baby carrots'],
  '洋葱': ['onion', 'brown onion', 'red onion', 'white onion'],
  '番茄': ['tomato', 'tomatoes', 'fresh tomatoes', 'cherry tomatoes', 'truss tomatoes'],
  '生菜': ['lettuce', 'iceberg lettuce', 'cos lettuce', 'baby spinach', 'salad mix'],
  '西兰花': ['broccoli', 'broccolini', 'fresh broccoli'],
  '黄瓜': ['cucumber', 'lebanese cucumber', 'telegraph cucumber'],
  '青椒': ['capsicum', 'red capsicum', 'green capsicum', 'yellow capsicum', 'bell pepper'],
  '蘑菇': ['mushrooms', 'button mushrooms', 'portobello mushrooms', 'white mushrooms'],
  '白菜': ['cabbage', 'wombok', 'chinese cabbage', 'pak choi', 'bok choy'],
  '大蒜': ['garlic', 'fresh garlic', 'garlic cloves'],
  '生姜': ['ginger', 'fresh ginger', 'root ginger'],

  // ===== 水果 =====
  '苹果': ['apple', 'apples', 'fresh apples', 'jazz apples', 'royal gala apples'],
  '香蕉': ['banana', 'bananas', 'fresh bananas'],
  '橙子': ['orange', 'oranges', 'fresh oranges', 'navel oranges'],
  '草莓': ['strawberries', 'fresh strawberries', 'strawberry punnet'],
  '葡萄': ['grapes', 'red grapes', 'green grapes', 'seedless grapes'],
  '蓝莓': ['blueberries', 'fresh blueberries', 'blueberry punnet'],
  '牛油果': ['avocado', 'avocados', 'hass avocado', 'fresh avocado'],
  '猕猴桃': ['kiwifruit', 'kiwi fruit', 'gold kiwifruit', 'green kiwifruit'],
  '柠檬': ['lemon', 'lemons', 'fresh lemons'],
  '西瓜': ['watermelon', 'seedless watermelon', 'fresh watermelon'],

  // ===== 调味品 =====
  '酱油': ['soy sauce', 'light soy sauce', 'dark soy sauce', 'soy sauce', 'all purpose soy sauce'],
  '盐': ['salt', 'table salt', 'sea salt', 'iodised salt', 'rock salt'],
  '糖': ['sugar', 'white sugar', 'brown sugar', 'raw sugar', 'caster sugar', 'icing sugar'],
  '食用油': ['cooking oil', 'vegetable oil', 'canola oil', 'sunflower oil', 'rice bran oil'],
  '橄榄油': ['olive oil', 'extra virgin olive oil', 'cooking olive oil'],
  '醋': ['vinegar', 'white vinegar', 'balsamic vinegar', 'apple cider vinegar', 'rice vinegar'],
  '蚝油': ['oyster sauce', 'oyster flavoured sauce'],
  '料酒': ['cooking wine', 'shaoxing wine', 'rice wine'],
  '番茄酱': ['tomato sauce', 'ketchup', 'pasta sauce', 'tomato paste'],
  '辣椒酱': ['chilli sauce', 'sweet chilli sauce', 'sriracha', 'hot sauce', 'chili sauce'],
  '蛋黄酱': ['mayonnaise', 'whole egg mayonnaise', 'kewpie mayonnaise'],
  '花生酱': ['peanut butter', 'crunchy peanut butter', 'smooth peanut butter'],
  '果酱': ['jam', 'strawberry jam', 'marmalade', 'fruit spread', 'marmite', 'vegemite'],
  '咖喱': ['curry', 'curry paste', 'curry powder', 'curry sauce', 'butter chicken'],

  // ===== 饮品 =====
  '咖啡': ['coffee', 'instant coffee', 'ground coffee', 'coffee beans', 'plunger coffee'],
  '茶': ['tea', 'black tea', 'green tea', 'herbal tea', 'tea bags', 'earl grey tea'],
  '可乐': ['coca cola', 'coke', 'cola', 'pepsi', 'diet coke'],
  '矿泉水': ['water', 'spring water', 'mineral water', 'sparkling water', 'still water'],
  '橙汁': ['orange juice', 'fresh orange juice', 'apple juice', 'fruit juice'],
  '豆奶': ['soy milk', 'soya milk', 'almond milk', 'oat milk', 'coconut milk'],

  // ===== 零食 =====
  '方便面': ['instant noodles', 'noodles', 'ramen', 'cup noodles', 'mi goreng'],
  '巧克力': ['chocolate', 'milk chocolate', 'dark chocolate', 'chocolate block', 'chocolate bar'],
  '饼干': ['biscuits', 'cookies', 'chocolate chip cookies', 'crackers', 'shortbread'],
  '薯片': ['chips', 'potato chips', 'corn chips', 'tortilla chips', 'crisps'],
  '冰淇淋': ['ice cream', 'vanilla ice cream', 'chocolate ice cream', 'ice cream tub'],

  // ===== 豆制品 =====
  '豆腐': ['tofu', 'firm tofu', 'silken tofu', 'fried tofu', 'tofu puffs'],

  // ===== 冷冻食品 =====
  '速冻水饺': ['frozen dumplings', 'dumplings', 'pork dumplings', 'chicken dumplings'],
  '冷冻蔬菜': ['frozen vegetables', 'frozen peas', 'frozen corn', 'frozen mixed vegetables'],
  '冷冻披萨': ['frozen pizza', 'pizza', 'frozen pepperoni pizza'],

  // ===== 日用品 =====
  '洗手液': ['hand wash', 'hand soap', 'liquid soap', 'antibacterial hand wash'],
  '洗发水': ['shampoo', 'hair shampoo', 'anti dandruff shampoo'],
  '沐浴露': ['body wash', 'shower gel', 'soap', 'body soap'],
  '洗衣液': ['laundry liquid', 'laundry detergent', 'washing powder', 'laundry powder'],
  '纸巾': ['tissues', 'facial tissues', 'paper towels', 'kitchen towels'],
  '卫生纸': ['toilet paper', 'toilet rolls', 'toilet tissue'],
  '牙膏': ['toothpaste', 'whitening toothpaste', 'fluoride toothpaste'],
  '牙刷': ['toothbrush', 'electric toothbrush', 'manual toothbrush'],
  '洗洁精': ['dishwashing liquid', 'dish soap', 'dishwashing detergent'],

  // ===== 火锅相关 =====
  '火锅底料': ['hot pot base', 'hotpot soup base', 'hot pot soup', 'spicy hot pot'],
  '火锅': ['hot pot', 'hotpot', 'hot pot soup base', 'hot pot meat'],
};

// Build reverse map: lowercase English keyword → Chinese name
const englishToChinese: Record<string, string> = {};
Object.entries(productTranslations).forEach(([cn, enList]) => {
  enList.forEach((en) => {
    const key = en.toLowerCase();
    if (!englishToChinese[key] || cn.length < englishToChinese[key].length) {
      englishToChinese[key] = cn;
    }
  });
});

export function getSearchKeywords(input: string): string[] {
  const trimmed = input.trim();
  if (trimmed === '') return [];

  // ---- Chinese input → English keywords ----
  if (/[一-鿿]/.test(trimmed)) {
    const exact = productTranslations[trimmed];
    if (exact) return exact;

    // Fuzzy: the input contains or is contained by a known Chinese term
    for (const [cn, enList] of Object.entries(productTranslations)) {
      if (cn.includes(trimmed) || trimmed.includes(cn)) {
        return enList;
      }
    }
    return [trimmed];
  }

  // ---- English input ----
  const lower = trimmed.toLowerCase();
  const keywords: string[] = [lower];        // always include the original phrase

  // Exact reverse lookup (e.g. "milk powder" → 奶粉 → all keywords for 奶粉)
  if (englishToChinese[lower]) {
    const cn = englishToChinese[lower];
    for (const kw of productTranslations[cn] || []) {
      if (kw.toLowerCase() !== lower) {
        keywords.push(kw.toLowerCase());
      }
    }
    return keywords;
  }

  // Partial reverse lookup: check each word and multi-word sub-phrase
  const words = lower.split(/\s+/);
  const matched = new Set<string>();

  // Try multi-word combos first (2-gram, then 1-gram)
  for (let len = Math.min(words.length, 3); len >= 1; len--) {
    for (let i = 0; i <= words.length - len; i++) {
      const phrase = words.slice(i, i + len).join(' ');
      const cn = englishToChinese[phrase];
      if (cn) {
        for (const kw of productTranslations[cn] || []) {
          const kwLower = kw.toLowerCase();
          if (kwLower !== lower && !matched.has(kwLower)) {
            matched.add(kwLower);
            keywords.push(kwLower);
          }
        }
      }
    }
  }

  return [...new Set(keywords)];
}

export { productTranslations };
