const RU_TO_LATIN: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

// Названия товаров/категорий вводятся по-русски — грубая транслитерация,
// достаточная для читаемого URL. Поле slug в форме всегда остаётся
// редактируемым, так что точность транслитерации не критична.
export function slugify(input: string) {
  return input
    .toLowerCase()
    .split("")
    .map((char) => RU_TO_LATIN[char] ?? char)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
