const TelegramBot = require("node-telegram-bot-api");
const { createClient } = require("@supabase/supabase-js");
const { nanoid } = require("nanoid");
require("dotenv").config();
require("./keep_alive");

const BOT_TOKEN = process.env.BOT_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const BASE_URL = process.env.BASE_URL || "https://koom.site";
const ADMIN_IDS = (process.env.ADMIN_IDS || "").split(",").map(id => id.trim()).filter(Boolean);

if (!BOT_TOKEN || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing env vars!"); process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const userState = {};
const userLang = {};

// ── TRANSLATIONS ──────────────────────────────────────────────────────────────
const T = {
  en: {
    welcome: (n) => `👋 *Welcome ${n}!*\n\n🚀 *koom.site Link Shortener Bot*\n\nShorten any long URL in one click!\n\nChoose an option below 👇`,
    menu_shorten: "🔗 Shorten Link", menu_mylinks: "📋 My Links",
    menu_find: "🔍 Find Link", menu_stats: "📊 Stats",
    menu_help: "❓ Help", menu_lang: "🌐 Language",
    cancel: "❌ Cancel", back: "🔙 Back", main_menu: "🏠 Main Menu",
    ask_url: "🔗 *Shorten a Link*\n\nSend the URL you want to shorten:\n_(must start with http:// or https://)_",
    ask_custom_code: "✅ URL received!\n\n🔑 *Want a custom short code?*\nType your code (e.g. `mybrand`) or type `skip`",
    ask_password: "🔒 *Want to add a password?*\nType a password or type `skip` (no password)",
    invalid_url: "❌ Invalid URL! Must start with http:// or https://",
    code_taken: "❌ Custom code already taken! Try another.",
    creating: "⏳ Creating your link...",
    link_created: (lk, sh) => `✅ *Link Created!*\n\n🔗 *Short URL:* \`${sh}\`\n📎 *Original:* ${lk.longurl.substring(0,60)}${lk.longurl.length>60?"...":""}\n🔑 *Code:* \`${lk.shortcode}\`\n🔒 *Password:* ${lk.password?"Yes ✅":"No ❌"}\n📅 *Created:* ${new Date(lk.createdat).toLocaleString("en-IN")}`,
    link_stats: (lk, sh) => `📊 *Link Stats*\n\n🔗 *Short URL:* \`${sh}\`\n📎 *Original:* ${lk.longurl.substring(0,70)}${lk.longurl.length>70?"...":""}\n👆 *Clicks:* ${lk.clicks||0}\n🔒 *Password:* ${lk.password?"Yes":"No"}\n✅ *Status:* ${lk.status}\n📅 *Created:* ${new Date(lk.createdat).toLocaleString("en-IN")}\n🕐 *Last Click:* ${lk.lastclicked?new Date(lk.lastclicked).toLocaleString("en-IN"):"Never"}`,
    my_links_title: (p, tp) => `📋 *My Links* (Page ${p}/${tp})\n\nSelect a link to manage:`,
    no_links: "📋 *My Links*\n\nNo links yet! Create your first one.",
    create_first: "🔗 Create Link",
    find_ask: "🔍 *Find Link*\n\nEnter the short code:",
    not_found: "❌ Link not found!",
    delete_confirm: (c) => `🗑️ *Delete this link?*\n\nCode: \`${c}\`\n\n⚠️ This cannot be undone!`,
    delete_yes: "✅ Yes, Delete", delete_no: "❌ No",
    deleted: (c) => `✅ *Deleted!*\n\n\`${c}\` is no longer active.`,
    delete_failed: "❌ Delete failed!",
    edit_ask: (c) => `✏️ *Edit Link*\n\nCode: \`${c}\`\n\nEnter new URL:`,
    edited: (c, sh) => `✅ *Updated!*\n\n🔗 \`${sh}\`\n📎 New URL saved.`,
    bot_stats: (tl, tc, top) => `📊 *Bot Statistics*\n\n🔗 Total Links: *${tl}*\n👆 Total Clicks: *${tc}*\n\n🏆 *Top Links:*\n${top||"No data yet"}`,
    admin_panel: (tl, tc, top) => `🔧 *Admin Panel*\n\n📊 Total Links: *${tl}*\n👆 Total Clicks: *${tc}*\n\n🏆 *Top 5 Links:*\n${top||"No data"}`,
    not_admin: "❌ You are not an admin!",
    cancelled: "❌ *Cancelled!* Back to main menu.",
    help: "❓ *koom.site Bot - Help*\n\n*Commands:*\n`/start` - Start the bot\n`/shorten <url>` - Quick shorten\n`/mylinks` - View your links\n`/admin` - Admin panel\n\n*Features:*\n• Custom short codes\n• Password protection\n• Click tracking\n• Edit / Delete links\n\n*Tip:* Just send any URL directly!",
    select_lang: "🌐 *Select your language:*",
    lang_set: "✅ Language set to English!",
    make_more: "🔗 Make Another", stats_btn: "📊 Stats",
    edit_btn: "✏️ Edit", delete_btn: "🗑️ Delete",
    prev: "⬅️ Prev", next: "Next ➡️",
    not_yours: "❌ This link doesn't belong to you!",
    unknown: "❓ I didn't understand. Type /help or send a URL.",
  },
  hi: {
    welcome: (n) => `👋 *नमस्ते ${n}!*\n\n🚀 *koom.site Link Shortener Bot*\n\nकिसी भी लंबी link को एक click में छोटा करो!\n\nनीचे से option चुनो 👇`,
    menu_shorten: "🔗 Link छोटी करो", menu_mylinks: "📋 मेरे Links",
    menu_find: "🔍 Link खोजो", menu_stats: "📊 Stats",
    menu_help: "❓ Help", menu_lang: "🌐 भाषा",
    cancel: "❌ रद्द करो", back: "🔙 वापस", main_menu: "🏠 Main Menu",
    ask_url: "🔗 *Link छोटी करो*\n\nवो URL भेजो जो छोटी करनी है:\n_(http:// या https:// से शुरू होनी चाहिए)_",
    ask_custom_code: "✅ URL मिली!\n\n🔑 *Custom code चाहिए?*\nCode type करो (जैसे `mybrand`) या `skip` लिखो",
    ask_password: "🔒 *Password लगाना चाहते हो?*\nPassword type करो या `skip` लिखो",
    invalid_url: "❌ सही URL नहीं है! http:// या https:// से शुरू होनी चाहिए",
    code_taken: "❌ यह code पहले से लिया गया है! कोई और try करो।",
    creating: "⏳ Link बना रहा हूँ...",
    link_created: (lk, sh) => `✅ *Link बन गई!*\n\n🔗 *Short URL:* \`${sh}\`\n📎 *Original:* ${lk.longurl.substring(0,60)}${lk.longurl.length>60?"...":""}\n🔑 *Code:* \`${lk.shortcode}\`\n🔒 *Password:* ${lk.password?"हाँ ✅":"नहीं ❌"}\n📅 *बनाई:* ${new Date(lk.createdat).toLocaleString("en-IN")}`,
    link_stats: (lk, sh) => `📊 *Link Stats*\n\n🔗 *Short URL:* \`${sh}\`\n📎 *Original:* ${lk.longurl.substring(0,70)}${lk.longurl.length>70?"...":""}\n👆 *Clicks:* ${lk.clicks||0}\n🔒 *Password:* ${lk.password?"हाँ":"नहीं"}\n✅ *Status:* ${lk.status}\n📅 *बनाई:* ${new Date(lk.createdat).toLocaleString("en-IN")}\n🕐 *Last Click:* ${lk.lastclicked?new Date(lk.lastclicked).toLocaleString("en-IN"):"कभी नहीं"}`,
    my_links_title: (p, tp) => `📋 *मेरे Links* (Page ${p}/${tp})\n\nLink चुनो manage करने के लिए:`,
    no_links: "📋 *मेरे Links*\n\nअभी कोई link नहीं! पहली link बनाओ।",
    create_first: "🔗 Link बनाओ",
    find_ask: "🔍 *Link खोजो*\n\nShort code type करो:",
    not_found: "❌ Link नहीं मिली!",
    delete_confirm: (c) => `🗑️ *Delete करना चाहते हो?*\n\nCode: \`${c}\`\n\n⚠️ यह undo नहीं होगा!`,
    delete_yes: "✅ हाँ, Delete करो", delete_no: "❌ नहीं",
    deleted: (c) => `✅ *Delete हो गया!*\n\n\`${c}\` अब काम नहीं करेगा।`,
    delete_failed: "❌ Delete नहीं हुआ!",
    edit_ask: (c) => `✏️ *Link Edit करो*\n\nCode: \`${c}\`\n\nनया URL type करो:`,
    edited: (c, sh) => `✅ *Update हो गया!*\n\n🔗 \`${sh}\`\n📎 नया URL save हो गया।`,
    bot_stats: (tl, tc, top) => `📊 *Bot Statistics*\n\n🔗 Total Links: *${tl}*\n👆 Total Clicks: *${tc}*\n\n🏆 *Top Links:*\n${top||"अभी कोई data नहीं"}`,
    admin_panel: (tl, tc, top) => `🔧 *Admin Panel*\n\n📊 Total Links: *${tl}*\n👆 Total Clicks: *${tc}*\n\n🏆 *Top 5:*\n${top||"कोई data नहीं"}`,
    not_admin: "❌ आप admin नहीं हैं!",
    cancelled: "❌ *रद्द हो गया!* Main menu पर वापस।",
    help: "❓ *koom.site Bot - Help*\n\n*Commands:*\n`/start` - Bot शुरू करो\n`/shorten <url>` - जल्दी shorten करो\n`/mylinks` - अपने links देखो\n`/admin` - Admin panel\n\n*Features:*\n• Custom short codes\n• Password protection\n• Click tracking\n• Edit / Delete links\n\n*Tip:* सीधे URL भेजो, bot automatically detect करेगा!",
    select_lang: "🌐 *अपनी भाषा चुनें:*",
    lang_set: "✅ भाषा हिंदी में सेट हो गई!",
    make_more: "🔗 और बनाओ", stats_btn: "📊 Stats",
    edit_btn: "✏️ Edit", delete_btn: "🗑️ Delete",
    prev: "⬅️ पिछला", next: "अगला ➡️",
    not_yours: "❌ यह link आपकी नहीं है!",
    unknown: "❓ समझ नहीं आया। /help type करो या URL भेजो।",
  },
  ur: {
    welcome: (n) => `👋 *السلام علیکم ${n}!*\n\n🚀 *koom.site Link Shortener Bot*\n\nکسی بھی لمبے لنک کو ایک کلک میں چھوٹا کریں!\n\nنیچے سے آپشن چنیں 👇`,
    menu_shorten: "🔗 لنک چھوٹا کریں", menu_mylinks: "📋 میرے لنکس",
    menu_find: "🔍 لنک تلاش کریں", menu_stats: "📊 اعداد",
    menu_help: "❓ مدد", menu_lang: "🌐 زبان",
    cancel: "❌ منسوخ", back: "🔙 واپس", main_menu: "🏠 مین مینو",
    ask_url: "🔗 *لنک چھوٹا کریں*\n\nوہ URL بھیجیں جو چھوٹا کرنا ہے:",
    ask_custom_code: "✅ URL مل گئی!\n\n🔑 *کسٹم کوڈ چاہیے؟*\nکوڈ ٹائپ کریں یا `skip` لکھیں",
    ask_password: "🔒 *پاسورڈ لگانا چاہتے ہیں؟*\nپاسورڈ ٹائپ کریں یا `skip` لکھیں",
    invalid_url: "❌ درست URL نہیں! http:// سے شروع ہونی چاہیے",
    code_taken: "❌ یہ کوڈ پہلے سے لیا گیا ہے!",
    creating: "⏳ لنک بنا رہا ہوں...",
    link_created: (lk, sh) => `✅ *لنک بن گیا!*\n\n🔗 *چھوٹا URL:* \`${sh}\`\n🔑 *کوڈ:* \`${lk.shortcode}\`\n🔒 *پاسورڈ:* ${lk.password?"ہاں ✅":"نہیں ❌"}`,
    link_stats: (lk, sh) => `📊 *لنک اعداد*\n\n🔗 \`${sh}\`\n👆 *کلکس:* ${lk.clicks||0}\n🔒 *پاسورڈ:* ${lk.password?"ہاں":"نہیں"}\n✅ *حالت:* ${lk.status}`,
    my_links_title: (p, tp) => `📋 *میرے لنکس* (صفحہ ${p}/${tp})\n\nلنک منتخب کریں:`,
    no_links: "📋 *میرے لنکس*\n\nابھی کوئی لنک نہیں! پہلا لنک بنائیں۔",
    create_first: "🔗 لنک بنائیں",
    find_ask: "🔍 *لنک تلاش کریں*\n\nشارٹ کوڈ ٹائپ کریں:",
    not_found: "❌ لنک نہیں ملا!",
    delete_confirm: (c) => `🗑️ *ڈیلیٹ کرنا چاہتے ہیں؟*\n\nکوڈ: \`${c}\`\n\n⚠️ یہ واپس نہیں ہوگا!`,
    delete_yes: "✅ ہاں ڈیلیٹ کریں", delete_no: "❌ نہیں",
    deleted: (c) => `✅ *ڈیلیٹ ہو گیا!*\n\n\`${c}\` اب کام نہیں کرے گا۔`,
    delete_failed: "❌ ڈیلیٹ نہیں ہوا!",
    edit_ask: (c) => `✏️ *لنک ایڈٹ کریں*\n\nنیا URL ٹائپ کریں:`,
    edited: (c, sh) => `✅ *اپڈیٹ ہو گیا!*\n\n🔗 \`${sh}\``,
    bot_stats: (tl, tc, top) => `📊 *اعداد و شمار*\n\n🔗 کل لنکس: *${tl}*\n👆 کل کلکس: *${tc}*\n\n🏆 *ٹاپ لنکس:*\n${top||"کوئی ڈیٹا نہیں"}`,
    admin_panel: (tl, tc, top) => `🔧 *ایڈمن پینل*\n\n🔗 کل: *${tl}*\n👆 کلکس: *${tc}*\n\n🏆 *ٹاپ:*\n${top||"کوئی ڈیٹا نہیں"}`,
    not_admin: "❌ آپ ایڈمن نہیں ہیں!",
    cancelled: "❌ *منسوخ!* مین مینو پر واپس۔",
    help: "❓ *koom.site Bot - مدد*\n\n`/start` - بوٹ شروع کریں\n`/mylinks` - میرے لنکس\n\n*ٹپ:* براہ راست URL بھیجیں!",
    select_lang: "🌐 *اپنی زبان چنیں:*",
    lang_set: "✅ زبان اردو میں سیٹ ہو گئی!",
    make_more: "🔗 اور بنائیں", stats_btn: "📊 اعداد",
    edit_btn: "✏️ ایڈٹ", delete_btn: "🗑️ ڈیلیٹ",
    prev: "⬅️ پچھلا", next: "اگلا ➡️",
    not_yours: "❌ یہ لنک آپ کا نہیں ہے!",
    unknown: "❓ سمجھ نہیں آیا۔ URL بھیجیں یا /help ٹائپ کریں۔",
  },
  bn: {
    welcome: (n) => `👋 *স্বাগতম ${n}!*\n\n🚀 *koom.site Link Shortener Bot*\n\nযেকোনো লম্বা লিঙ্ক এক ক্লিকে ছোট করুন!\n\nনিচে থেকে অপশন বেছে নিন 👇`,
    menu_shorten: "🔗 লিঙ্ক ছোট করুন", menu_mylinks: "📋 আমার লিঙ্কস",
    menu_find: "🔍 লিঙ্ক খুঁজুন", menu_stats: "📊 পরিসংখ্যান",
    menu_help: "❓ সাহায্য", menu_lang: "🌐 ভাষা",
    cancel: "❌ বাতিল", back: "🔙 পিছনে", main_menu: "🏠 মেইন মেনু",
    ask_url: "🔗 *লিঙ্ক ছোট করুন*\n\nURL পাঠান:",
    ask_custom_code: "✅ URL পেয়েছি!\n\n🔑 *কাস্টম কোড চাই?*\nকোড টাইপ করুন বা `skip` লিখুন",
    ask_password: "🔒 *পাসওয়ার্ড দিতে চান?*\nপাসওয়ার্ড টাইপ করুন বা `skip` লিখুন",
    invalid_url: "❌ সঠিক URL নয়! http:// দিয়ে শুরু হতে হবে",
    code_taken: "❌ এই কোড আগেই নেওয়া হয়েছে!",
    creating: "⏳ লিঙ্ক তৈরি হচ্ছে...",
    link_created: (lk, sh) => `✅ *লিঙ্ক তৈরি!*\n\n🔗 *Short URL:* \`${sh}\`\n🔑 *কোড:* \`${lk.shortcode}\`\n🔒 *পাসওয়ার্ড:* ${lk.password?"হ্যাঁ ✅":"না ❌"}`,
    link_stats: (lk, sh) => `📊 *লিঙ্ক পরিসংখ্যান*\n\n🔗 \`${sh}\`\n👆 *ক্লিক:* ${lk.clicks||0}\n🔒 *পাসওয়ার্ড:* ${lk.password?"হ্যাঁ":"না"}`,
    my_links_title: (p, tp) => `📋 *আমার লিঙ্কস* (পৃষ্ঠা ${p}/${tp})\n\nলিঙ্ক বেছে নিন:`,
    no_links: "📋 *আমার লিঙ্কস*\n\nএখনো কোনো লিঙ্ক নেই!",
    create_first: "🔗 লিঙ্ক তৈরি করুন",
    find_ask: "🔍 *লিঙ্ক খুঁজুন*\n\nশর্ট কোড টাইপ করুন:",
    not_found: "❌ লিঙ্ক পাওয়া যায়নি!",
    delete_confirm: (c) => `🗑️ *মুছে ফেলবেন?*\n\nকোড: \`${c}\`\n\n⚠️ পূর্বাবস্থায় ফেরানো যাবে না!`,
    delete_yes: "✅ হ্যাঁ মুছুন", delete_no: "❌ না",
    deleted: (c) => `✅ *মুছে গেছে!*\n\n\`${c}\` আর কাজ করবে না।`,
    delete_failed: "❌ মোছা ব্যর্থ!",
    edit_ask: (c) => `✏️ *লিঙ্ক সম্পাদনা*\n\nনতুন URL টাইপ করুন:`,
    edited: (c, sh) => `✅ *আপডেট হয়েছে!*\n\n🔗 \`${sh}\``,
    bot_stats: (tl, tc, top) => `📊 *পরিসংখ্যান*\n\n🔗 মোট লিঙ্ক: *${tl}*\n👆 মোট ক্লিক: *${tc}*\n\n🏆 *শীর্ষ লিঙ্কস:*\n${top||"কোনো ডেটা নেই"}`,
    admin_panel: (tl, tc, top) => `🔧 *এডমিন প্যানেল*\n\n🔗 মোট: *${tl}*\n👆 ক্লিক: *${tc}*\n\n🏆 *শীর্ষ:*\n${top||"কোনো ডেটা নেই"}`,
    not_admin: "❌ আপনি এডমিন নন!",
    cancelled: "❌ *বাতিল!* মেইন মেনুতে ফিরে গেছেন।",
    help: "❓ *koom.site Bot - সাহায্য*\n\n`/start` - বট শুরু করুন\n`/mylinks` - আমার লিঙ্কস\n\n*টিপ:* সরাসরি URL পাঠান!",
    select_lang: "🌐 *আপনার ভাষা বেছে নিন:*",
    lang_set: "✅ ভাষা বাংলায় সেট হয়েছে!",
    make_more: "🔗 আরো তৈরি করুন", stats_btn: "📊 পরিসংখ্যান",
    edit_btn: "✏️ সম্পাদনা", delete_btn: "🗑️ মুছুন",
    prev: "⬅️ আগের", next: "পরের ➡️",
    not_yours: "❌ এই লিঙ্কটি আপনার নয়!",
    unknown: "❓ বুঝতে পারিনি। URL পাঠান বা /help টাইপ করুন।",
  },
  es: {
    welcome: (n) => `👋 *¡Hola ${n}!*\n\n🚀 *koom.site Link Shortener Bot*\n\n¡Acorta cualquier enlace largo con un clic!\n\nElige una opción abajo 👇`,
    menu_shorten: "🔗 Acortar enlace", menu_mylinks: "📋 Mis enlaces",
    menu_find: "🔍 Buscar enlace", menu_stats: "📊 Estadísticas",
    menu_help: "❓ Ayuda", menu_lang: "🌐 Idioma",
    cancel: "❌ Cancelar", back: "🔙 Atrás", main_menu: "🏠 Menú principal",
    ask_url: "🔗 *Acortar enlace*\n\nEnvía el URL que quieres acortar:",
    ask_custom_code: "✅ ¡URL recibido!\n\n🔑 *¿Código personalizado?*\nEscribe tu código o escribe `skip`",
    ask_password: "🔒 *¿Añadir contraseña?*\nEscribe una contraseña o `skip`",
    invalid_url: "❌ URL no válido! Debe comenzar con http://",
    code_taken: "❌ ¡Ese código ya está en uso!",
    creating: "⏳ Creando tu enlace...",
    link_created: (lk, sh) => `✅ *¡Enlace creado!*\n\n🔗 *URL corto:* \`${sh}\`\n🔑 *Código:* \`${lk.shortcode}\`\n🔒 *Contraseña:* ${lk.password?"Sí ✅":"No ❌"}`,
    link_stats: (lk, sh) => `📊 *Estadísticas*\n\n🔗 \`${sh}\`\n👆 *Clics:* ${lk.clicks||0}\n🔒 *Contraseña:* ${lk.password?"Sí":"No"}`,
    my_links_title: (p, tp) => `📋 *Mis enlaces* (Página ${p}/${tp})\n\nSelecciona un enlace:`,
    no_links: "📋 *Mis enlaces*\n\n¡Aún no hay enlaces!",
    create_first: "🔗 Crear enlace",
    find_ask: "🔍 *Buscar enlace*\n\nEscribe el código corto:",
    not_found: "❌ ¡Enlace no encontrado!",
    delete_confirm: (c) => `🗑️ *¿Eliminar este enlace?*\n\nCódigo: \`${c}\`\n\n⚠️ ¡No se puede deshacer!`,
    delete_yes: "✅ Sí, eliminar", delete_no: "❌ No",
    deleted: (c) => `✅ *¡Eliminado!*\n\n\`${c}\` ya no está activo.`,
    delete_failed: "❌ ¡Error al eliminar!",
    edit_ask: (c) => `✏️ *Editar enlace*\n\nEscribe el nuevo URL:`,
    edited: (c, sh) => `✅ *¡Actualizado!*\n\n🔗 \`${sh}\``,
    bot_stats: (tl, tc, top) => `📊 *Estadísticas del Bot*\n\n🔗 Total: *${tl}*\n👆 Clics: *${tc}*\n\n🏆 *Top enlaces:*\n${top||"Sin datos"}`,
    admin_panel: (tl, tc, top) => `🔧 *Panel Admin*\n\n🔗 Total: *${tl}*\n👆 Clics: *${tc}*\n\n🏆 *Top:*\n${top||"Sin datos"}`,
    not_admin: "❌ ¡No eres administrador!",
    cancelled: "❌ *¡Cancelado!* De vuelta al menú.",
    help: "❓ *koom.site Bot - Ayuda*\n\n`/start` - Iniciar bot\n`/mylinks` - Ver mis enlaces\n\n*Consejo:* ¡Envía directamente una URL!",
    select_lang: "🌐 *Selecciona tu idioma:*",
    lang_set: "✅ ¡Idioma configurado en Español!",
    make_more: "🔗 Crear otro", stats_btn: "📊 Stats",
    edit_btn: "✏️ Editar", delete_btn: "🗑️ Eliminar",
    prev: "⬅️ Anterior", next: "Siguiente ➡️",
    not_yours: "❌ ¡Este enlace no te pertenece!",
    unknown: "❓ No entendí. Envía una URL o escribe /help.",
  },
  ar: {
    welcome: (n) => `👋 *مرحباً ${n}!*\n\n🚀 *koom.site Link Shortener Bot*\n\nاختصر أي رابط طويل بنقرة واحدة!\n\nاختر خياراً من الأسفل 👇`,
    menu_shorten: "🔗 اختصر رابطاً", menu_mylinks: "📋 روابطي",
    menu_find: "🔍 ابحث عن رابط", menu_stats: "📊 إحصائيات",
    menu_help: "❓ مساعدة", menu_lang: "🌐 اللغة",
    cancel: "❌ إلغاء", back: "🔙 رجوع", main_menu: "🏠 القائمة الرئيسية",
    ask_url: "🔗 *اختصر رابطاً*\n\nأرسل الرابط الذي تريد اختصاره:",
    ask_custom_code: "✅ تم استلام الرابط!\n\n🔑 *تريد رمزاً مخصصاً؟*\nاكتب الرمز أو اكتب `skip`",
    ask_password: "🔒 *تريد إضافة كلمة مرور؟*\nاكتب كلمة المرور أو `skip`",
    invalid_url: "❌ الرابط غير صالح! يجب أن يبدأ بـ http://",
    code_taken: "❌ هذا الرمز مستخدم بالفعل!",
    creating: "⏳ جاري إنشاء الرابط...",
    link_created: (lk, sh) => `✅ *تم إنشاء الرابط!*\n\n🔗 *الرابط القصير:* \`${sh}\`\n🔑 *الرمز:* \`${lk.shortcode}\`\n🔒 *كلمة المرور:* ${lk.password?"نعم ✅":"لا ❌"}`,
    link_stats: (lk, sh) => `📊 *إحصائيات الرابط*\n\n🔗 \`${sh}\`\n👆 *النقرات:* ${lk.clicks||0}\n🔒 *كلمة المرور:* ${lk.password?"نعم":"لا"}`,
    my_links_title: (p, tp) => `📋 *روابطي* (صفحة ${p}/${tp})\n\nاختر رابطاً:`,
    no_links: "📋 *روابطي*\n\nلا توجد روابط بعد!",
    create_first: "🔗 إنشاء رابط",
    find_ask: "🔍 *ابحث عن رابط*\n\nاكتب الرمز القصير:",
    not_found: "❌ لم يتم العثور على الرابط!",
    delete_confirm: (c) => `🗑️ *حذف هذا الرابط؟*\n\nالرمز: \`${c}\`\n\n⚠️ لا يمكن التراجع!`,
    delete_yes: "✅ نعم احذف", delete_no: "❌ لا",
    deleted: (c) => `✅ *تم الحذف!*\n\n\`${c}\` لم يعد نشطاً.`,
    delete_failed: "❌ فشل الحذف!",
    edit_ask: (c) => `✏️ *تعديل الرابط*\n\nاكتب الرابط الجديد:`,
    edited: (c, sh) => `✅ *تم التحديث!*\n\n🔗 \`${sh}\``,
    bot_stats: (tl, tc, top) => `📊 *إحصائيات البوت*\n\n🔗 الروابط: *${tl}*\n👆 النقرات: *${tc}*\n\n🏆 *أفضل روابط:*\n${top||"لا توجد بيانات"}`,
    admin_panel: (tl, tc, top) => `🔧 *لوحة الإدارة*\n\n🔗 الروابط: *${tl}*\n👆 النقرات: *${tc}*\n\n🏆 *الأفضل:*\n${top||"لا توجد بيانات"}`,
    not_admin: "❌ أنت لست مسؤولاً!",
    cancelled: "❌ *تم الإلغاء!* عودة إلى القائمة.",
    help: "❓ *koom.site Bot - مساعدة*\n\n`/start` - تشغيل البوت\n`/mylinks` - روابطي\n\n*نصيحة:* أرسل الرابط مباشرة!",
    select_lang: "🌐 *اختر لغتك:*",
    lang_set: "✅ تم تعيين اللغة إلى العربية!",
    make_more: "🔗 إنشاء آخر", stats_btn: "📊 إحصائيات",
    edit_btn: "✏️ تعديل", delete_btn: "🗑️ حذف",
    prev: "⬅️ السابق", next: "التالي ➡️",
    not_yours: "❌ هذا الرابط ليس لك!",
    unknown: "❓ لم أفهم. أرسل رابطاً أو اكتب /help.",
  }
};

function t(chatId, key, ...args) {
  const lang = userLang[chatId] || "en";
  const fn = (T[lang] && T[lang][key]) || T["en"][key];
  if (typeof fn === "function") return fn(...args);
  return fn || key;
}

// ── DB HELPERS ────────────────────────────────────────────────────────────────
function isValidUrl(url) { try { new URL(url); return true; } catch { return false; } }
function isAdmin(chatId) { return ADMIN_IDS.includes(String(chatId)); }
function shortUrl(code) { return BASE_URL + "/" + code; }
function generateCode() { return nanoid(6); }

async function createLink(longurl, customCode, password, userId) {
  const shortcode = customCode || generateCode();
  if (customCode) {
    const { data: ex } = await supabase.from("links").select("shortcode").eq("shortcode", customCode).single();
    if (ex) return { error: "code_taken" };
  }
  // Save with user_id + source="telegram" so website links stay separate
  const { data, error } = await supabase.from("links").insert({
    shortcode, longurl, password: password || null,
    encrypted: !!password, status: "active",
    user_id: String(userId),
    source: "telegram"
  }).select().single();

  if (error) {
    // Fallback if source column missing — still save user_id
    const { data: d2, error: e2 } = await supabase.from("links").insert({
      shortcode, longurl, password: password || null,
      encrypted: !!password, status: "active",
      user_id: String(userId)
    }).select().single();
    if (e2) return { error: e2.message };
    return { data: d2 };
  }
  return { data };
}

async function getLinkByCode(shortcode) {
  const { data } = await supabase.from("links").select("*").eq("shortcode", shortcode).single();
  return data;
}

// Find link — only return if it belongs to this Telegram user
async function getUserLinkByCode(shortcode, userId) {
  const { data } = await supabase.from("links").select("*")
    .eq("shortcode", shortcode).eq("status", "active").single();
  if (!data) return { status: "not_found" };

  // Website link (no user_id OR source is web/null) — bot users can't access it
  if (!data.user_id) return { status: "not_yours" };

  // Belongs to different Telegram user
  if (data.user_id !== String(userId)) return { status: "not_yours" };

  // It's yours!
  return { status: "ok", link: data };
}

// Get link by code only if owned by this Telegram user (for edit/delete)
async function getOwnedLink(shortcode, userId) {
  const { data } = await supabase.from("links").select("*")
    .eq("shortcode", shortcode).eq("status", "active").single();
  if (!data) return null;
  // Website links (no user_id) are not accessible via bot
  if (!data.user_id) return null;
  if (data.user_id !== String(userId)) return null;
  return data;
}

async function getUserLinks(userId, page) {
  // Only show links created via Telegram by this specific user
  // Website links (source="web" or NULL user_id) are completely excluded
  let query = supabase.from("links")
    .select("*", { count: "exact" })
    .eq("status", "active")
    .eq("user_id", String(userId));

  // Try with source filter first (only telegram links)
  const { data, count, error } = await query
    .eq("source", "telegram")
    .order("createdat", { ascending: false })
    .range(page * 5, page * 5 + 4);

  if (error) {
    // source column missing — fallback to just user_id filter (still safe)
    const { data: d2, count: c2 } = await supabase.from("links")
      .select("*", { count: "exact" })
      .eq("status", "active")
      .eq("user_id", String(userId))
      .order("createdat", { ascending: false })
      .range(page * 5, page * 5 + 4);
    return { data: d2 || [], count: c2 || 0 };
  }
  return { data: data || [], count: count || 0 };
}

async function deleteLink(shortcode) {
  const { error } = await supabase.from("links").update({ status: "deleted" }).eq("shortcode", shortcode);
  return !error;
}

async function updateLink(shortcode, newUrl) {
  const { data, error } = await supabase.from("links")
    .update({ longurl: newUrl, updatedat: new Date().toISOString() })
    .eq("shortcode", shortcode).select().single();
  if (error) return { error: error.message };
  return { data };
}

async function getAllStats() {
  const { count: totalLinks } = await supabase.from("links").select("*", { count: "exact", head: true });
  const { data: cd } = await supabase.from("links").select("clicks");
  const totalClicks = (cd || []).reduce((s, r) => s + (r.clicks || 0), 0);
  const { data: topLinks } = await supabase.from("links").select("shortcode, clicks")
    .eq("status", "active").order("clicks", { ascending: false }).limit(5);
  return { totalLinks: totalLinks || 0, totalClicks, topLinks: topLinks || [] };
}

// ── KEYBOARDS ─────────────────────────────────────────────────────────────────
function mainMenu(chatId) {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: t(chatId, "menu_shorten"), callback_data: "shorten" }, { text: t(chatId, "menu_mylinks"), callback_data: "mylinks_0" }],
        [{ text: t(chatId, "menu_find"), callback_data: "find" }, { text: t(chatId, "menu_stats"), callback_data: "stats" }],
        [{ text: t(chatId, "menu_lang"), callback_data: "lang" }, { text: t(chatId, "menu_help"), callback_data: "help" }]
      ]
    }
  };
}

function cancelKb(chatId) {
  return { reply_markup: { inline_keyboard: [[{ text: t(chatId, "cancel"), callback_data: "cancel" }]] } };
}

function linkActionsKb(chatId, shortcode) {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: t(chatId, "stats_btn"), callback_data: "lstats_" + shortcode }, { text: t(chatId, "edit_btn"), callback_data: "edit_" + shortcode }],
        [{ text: t(chatId, "delete_btn"), callback_data: "del_" + shortcode }, { text: t(chatId, "back"), callback_data: "mylinks_0" }]
      ]
    }
  };
}

function langKb() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🇬🇧 English", callback_data: "setlang_en" }, { text: "🇮🇳 हिंदी", callback_data: "setlang_hi" }],
        [{ text: "🇵🇰 اردو", callback_data: "setlang_ur" }, { text: "🇧🇩 বাংলা", callback_data: "setlang_bn" }],
        [{ text: "🇪🇸 Español", callback_data: "setlang_es" }, { text: "🇸🇦 العربية", callback_data: "setlang_ar" }]
      ]
    }
  };
}

// ── COMMANDS ──────────────────────────────────────────────────────────────────
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const name = msg.from.first_name || "User";
  userState[chatId] = null;
  if (!userLang[chatId]) {
    const tl = (msg.from.language_code || "en").substring(0, 2);
    userLang[chatId] = T[tl] ? tl : "en";
  }
  bot.sendMessage(chatId, t(chatId, "welcome", name), { parse_mode: "Markdown", ...mainMenu(chatId) });
});

bot.onText(/\/help/, (msg) => sendHelp(msg.chat.id));
bot.onText(/\/mylinks/, (msg) => sendMyLinks(msg.chat.id, msg.from.id, 0));

bot.onText(/\/admin/, async (msg) => {
  const chatId = msg.chat.id;
  if (!isAdmin(chatId)) return bot.sendMessage(chatId, t(chatId, "not_admin"));
  const s = await getAllStats();
  const top = s.topLinks.map((l, i) => `${i+1}. \`${l.shortcode}\` - ${l.clicks} clicks`).join("\n");
  bot.sendMessage(chatId, t(chatId, "admin_panel", s.totalLinks, s.totalClicks, top), { parse_mode: "Markdown" });
});

// ── MESSAGE HANDLER ───────────────────────────────────────────────────────────
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text;
  if (!text || text.startsWith("/")) return;
  if (!userLang[chatId]) userLang[chatId] = "en";

  const state = userState[chatId];

  if (!state) {
    if (isValidUrl(text)) {
      userState[chatId] = { step: "awaiting_custom_code", data: { longurl: text } };
      return bot.sendMessage(chatId, t(chatId, "ask_custom_code"), { parse_mode: "Markdown", ...cancelKb(chatId) });
    }
    return bot.sendMessage(chatId, t(chatId, "unknown"), mainMenu(chatId));
  }

  if (state.step === "awaiting_url") {
    if (!isValidUrl(text)) return bot.sendMessage(chatId, t(chatId, "invalid_url"), cancelKb(chatId));
    userState[chatId] = { step: "awaiting_custom_code", data: { longurl: text } };
    return bot.sendMessage(chatId, t(chatId, "ask_custom_code"), { parse_mode: "Markdown", ...cancelKb(chatId) });
  }

  if (state.step === "awaiting_custom_code") {
    const customCode = text.toLowerCase() === "skip" ? null : text.replace(/[^a-zA-Z0-9_-]/g, "");
    userState[chatId] = { step: "awaiting_password", data: { ...state.data, customCode } };
    return bot.sendMessage(chatId, t(chatId, "ask_password"), { parse_mode: "Markdown", ...cancelKb(chatId) });
  }

  if (state.step === "awaiting_password") {
    const password = text.toLowerCase() === "skip" ? null : text;
    const { longurl, customCode } = state.data;
    userState[chatId] = null;
    const loadMsg = await bot.sendMessage(chatId, t(chatId, "creating"));
    const result = await createLink(longurl, customCode, password, userId);
    bot.deleteMessage(chatId, loadMsg.message_id).catch(() => {});
    if (result.error === "code_taken") return bot.sendMessage(chatId, t(chatId, "code_taken"), mainMenu(chatId));
    if (result.error) return bot.sendMessage(chatId, "❌ " + result.error, mainMenu(chatId));
    return bot.sendMessage(chatId, t(chatId, "link_created", result.data, shortUrl(result.data.shortcode)), {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: t(chatId, "stats_btn"), callback_data: "lstats_" + result.data.shortcode }, { text: t(chatId, "make_more"), callback_data: "shorten" }],
          [{ text: t(chatId, "main_menu"), callback_data: "menu" }]
        ]
      }
    });
  }

  if (state.step === "awaiting_find_code") {
    userState[chatId] = null;
    const result = await getUserLinkByCode(text.trim(), userId);
    if (result.status === "not_found") return bot.sendMessage(chatId, t(chatId, "not_found"), mainMenu(chatId));
    if (result.status === "not_yours") return bot.sendMessage(chatId, t(chatId, "not_yours"), mainMenu(chatId));
    return bot.sendMessage(chatId, t(chatId, "link_stats", result.link, shortUrl(result.link.shortcode)), { parse_mode: "Markdown", ...linkActionsKb(chatId, result.link.shortcode) });
  }

  if (state.step === "awaiting_edit_url") {
    if (!isValidUrl(text)) return bot.sendMessage(chatId, t(chatId, "invalid_url"), cancelKb(chatId));
    const { shortcode } = state.data;
    userState[chatId] = null;
    const result = await updateLink(shortcode, text);
    if (result.error) return bot.sendMessage(chatId, "❌ " + result.error);
    return bot.sendMessage(chatId, t(chatId, "edited", shortcode, shortUrl(shortcode)), { parse_mode: "Markdown", ...linkActionsKb(chatId, shortcode) });
  }
});

// ── CALLBACK HANDLER ──────────────────────────────────────────────────────────
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const msgId = query.message.message_id;
  const data = query.data;
  bot.answerCallbackQuery(query.id).catch(() => {});
  if (!userLang[chatId]) userLang[chatId] = "en";

  const edit = (text, extra) => bot.editMessageText(text, { chat_id: chatId, message_id: msgId, parse_mode: "Markdown", ...extra });

  if (data === "menu") { userState[chatId] = null; return edit("🏠 *Main Menu*", mainMenu(chatId)); }
  if (data === "cancel") { userState[chatId] = null; return edit(t(chatId, "cancelled"), mainMenu(chatId)); }
  if (data === "shorten") {
    userState[chatId] = { step: "awaiting_url", data: {} };
    return edit(t(chatId, "ask_url"), { parse_mode: "Markdown", ...cancelKb(chatId) });
  }
  if (data === "help") return sendHelp(chatId, msgId);
  if (data === "lang") return edit(t(chatId, "select_lang"), { parse_mode: "Markdown", ...langKb() });

  if (data.startsWith("setlang_")) {
    const lang = data.replace("setlang_", "");
    userLang[chatId] = lang;
    return edit(t(chatId, "lang_set") + "\n\n🏠 *Main Menu*", mainMenu(chatId));
  }

  if (data === "find") {
    userState[chatId] = { step: "awaiting_find_code", data: {} };
    return edit(t(chatId, "find_ask"), { parse_mode: "Markdown", ...cancelKb(chatId) });
  }

  if (data === "stats") {
    const s = await getAllStats();
    const top = s.topLinks.map((l, i) => `${i+1}. \`${l.shortcode}\` - ${l.clicks} clicks`).join("\n");
    return edit(t(chatId, "bot_stats", s.totalLinks, s.totalClicks, top || "-"), {
      reply_markup: { inline_keyboard: [[{ text: t(chatId, "back"), callback_data: "menu" }]] }
    });
  }

  if (data.startsWith("mylinks_")) {
    const page = parseInt(data.split("_")[1]) || 0;
    return sendMyLinks(chatId, userId, page, msgId);
  }

  if (data.startsWith("lstats_") || data.startsWith("linfo_")) {
    const code = data.replace("lstats_", "").replace("linfo_", "");
    const link = await getLinkByCode(code);
    if (!link) return bot.sendMessage(chatId, t(chatId, "not_found"));
    return edit(t(chatId, "link_stats", link, shortUrl(link.shortcode)), linkActionsKb(chatId, link.shortcode));
  }

  if (data.startsWith("edit_")) {
    const code = data.replace("edit_", "");
    userState[chatId] = { step: "awaiting_edit_url", data: { shortcode: code } };
    return edit(t(chatId, "edit_ask", code), { parse_mode: "Markdown", ...cancelKb(chatId) });
  }

  if (data.startsWith("del_")) {
    const code = data.replace("del_", "");
    return edit(t(chatId, "delete_confirm", code), {
      reply_markup: {
        inline_keyboard: [[
          { text: t(chatId, "delete_yes"), callback_data: "confirmDel_" + code },
          { text: t(chatId, "delete_no"), callback_data: "lstats_" + code }
        ]]
      }
    });
  }

  if (data.startsWith("confirmDel_")) {
    const code = data.replace("confirmDel_", "");
    const ok = await deleteLink(code);
    return edit(ok ? t(chatId, "deleted", code) : t(chatId, "delete_failed"), {
      reply_markup: { inline_keyboard: [[{ text: t(chatId, "main_menu"), callback_data: "menu" }]] }
    });
  }
});

// ── HELPERS ───────────────────────────────────────────────────────────────────
async function sendMyLinks(chatId, userId, page, editMsgId) {
  const { data: links, count } = await getUserLinks(userId, page);
  const totalPages = Math.max(1, Math.ceil(count / 5));

  if (!links || links.length === 0) {
    const text = t(chatId, "no_links");
    const opts = {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: [[{ text: t(chatId, "create_first"), callback_data: "shorten" }], [{ text: t(chatId, "back"), callback_data: "menu" }]] }
    };
    return editMsgId ? bot.editMessageText(text, { chat_id: chatId, message_id: editMsgId, ...opts }) : bot.sendMessage(chatId, text, opts);
  }

  const linkButtons = links.map(l => [{ text: "🔗 " + l.shortcode + "  |  👆 " + (l.clicks || 0), callback_data: "linfo_" + l.shortcode }]);
  const navButtons = [];
  if (page > 0) navButtons.push({ text: t(chatId, "prev"), callback_data: "mylinks_" + (page - 1) });
  if (page < totalPages - 1) navButtons.push({ text: t(chatId, "next"), callback_data: "mylinks_" + (page + 1) });

  const keyboard = [...linkButtons, ...(navButtons.length ? [navButtons] : []), [{ text: t(chatId, "main_menu"), callback_data: "menu" }]];
  const text = t(chatId, "my_links_title", page + 1, totalPages);
  const opts = { parse_mode: "Markdown", reply_markup: { inline_keyboard: keyboard } };
  return editMsgId ? bot.editMessageText(text, { chat_id: chatId, message_id: editMsgId, ...opts }) : bot.sendMessage(chatId, text, opts);
}

async function sendHelp(chatId, editMsgId) {
  const text = t(chatId, "help");
  const opts = { parse_mode: "Markdown", reply_markup: { inline_keyboard: [[{ text: t(chatId, "back"), callback_data: "menu" }]] } };
  return editMsgId ? bot.editMessageText(text, { chat_id: chatId, message_id: editMsgId, ...opts }) : bot.sendMessage(chatId, text, opts);
}

bot.on("polling_error", (err) => console.error("Polling error:", err.message));
console.log("🚀 koom.site Bot chal raha hai!");
