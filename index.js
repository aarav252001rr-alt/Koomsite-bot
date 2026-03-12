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
const CHANNEL_USERNAME = process.env.CHANNEL_USERNAME || ""; // e.g. "@mychannel"

if (!BOT_TOKEN || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing env vars!"); process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const userState = {};
const userLang = {};

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const T = {
  en: {
    welcome: (n) => `👋 *Welcome ${n}!*\n\n🚀 *koom.site Link Shortener Bot*\n\nShorten any long URL in one click!\n\nChoose an option below 👇`,
    join_required: (ch) => `⚠️ *Please join our channel first!*\n\n📢 Channel: ${ch}\n\nJoin karo phir /start karo.`,
    join_btn: "📢 Join Channel",
    joined_btn: "✅ I Joined",
    menu_shorten: "🔗 Shorten Link", menu_mylinks: "📋 My Links",
    menu_find: "🔍 Find Link", menu_stats: "📊 Stats",
    menu_help: "❓ Help", menu_lang: "🌐 Language",
    cancel: "❌ Cancel", back: "🔙 Back", main_menu: "🏠 Main Menu",
    skip: "⏭️ Skip",
    ask_url: "🔗 *Shorten a Link*\n\nSend the URL you want to shorten:",
    ask_custom_code: "🔑 *Custom short code chahiye?*\nType your code (e.g. `mybrand`) or press Skip:",
    ask_password: "🔒 *Add a password?*\nType a password or press Skip:",
    ask_edit_choice: "✏️ *What do you want to edit?*",
    ask_new_url: "📎 Send the new URL:",
    ask_new_code: "🔑 Send the new short code:",
    ask_new_password: "🔒 Send the new password (or Skip to remove):",
    edit_url_btn: "📎 Edit URL",
    edit_code_btn: "🔑 Edit Short Code",
    edit_pass_btn: "🔒 Edit Password",
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
    not_yours: "❌ This link doesn't belong to you!",
    delete_confirm: (c) => `🗑️ *Delete this link?*\n\nCode: \`${c}\`\n\n⚠️ This cannot be undone!`,
    delete_yes: "✅ Yes, Delete", delete_no: "❌ No",
    deleted: (c) => `✅ *Deleted!*\n\n\`${c}\` is no longer active.`,
    delete_failed: "❌ Delete failed!",
    edited: (c, sh) => `✅ *Updated!*\n\n🔗 \`${sh}\`\n📎 Changes saved.`,
    bot_stats: (tl, tc, top) => `📊 *Bot Statistics*\n\n🔗 Total Links: *${tl}*\n👆 Total Clicks: *${tc}*\n\n🏆 *Top Links:*\n${top||"No data yet"}`,
    not_admin: "❌ You are not an admin!",
    banned: "🚫 You are banned from using this bot!",
    cancelled: "❌ *Cancelled!* Back to main menu.",
    help: "❓ *koom.site Bot - Help*\n\n*Commands:*\n`/start` - Start the bot\n`/mylinks` - View your links\n`/admin` - Admin panel\n\n*Features:*\n• Custom short codes\n• Password protection\n• Click tracking\n• Edit / Delete links\n\n*Tip:* Just send any URL directly!",
    select_lang: "🌐 *Select your language:*",
    lang_set: "✅ Language set to English!",
    make_more: "🔗 Make Another", stats_btn: "📊 Stats",
    edit_btn: "✏️ Edit", delete_btn: "🗑️ Delete",
    prev: "⬅️ Prev", next: "Next ➡️",
    unknown: "❓ I didn't understand. Type /help or send a URL.",
    pass_removed: "🔓 Password removed.",
    code_updated: (c) => `✅ Short code updated to \`${c}\``,
  },
  hi: {
    welcome: (n) => `👋 *नमस्ते ${n}!*\n\n🚀 *koom.site Link Shortener Bot*\n\nकिसी भी लंबी link को एक click में छोटा करो!\n\nनीचे से option चुनो 👇`,
    join_required: (ch) => `⚠️ *पहले हमारा channel join करो!*\n\n📢 Channel: ${ch}\n\nJoin करो फिर /start करो।`,
    join_btn: "📢 Channel Join करो",
    joined_btn: "✅ मैंने Join कर लिया",
    menu_shorten: "🔗 Link छोटी करो", menu_mylinks: "📋 मेरे Links",
    menu_find: "🔍 Link खोजो", menu_stats: "📊 Stats",
    menu_help: "❓ Help", menu_lang: "🌐 भाषा",
    cancel: "❌ रद्द करो", back: "🔙 वापस", main_menu: "🏠 Main Menu",
    skip: "⏭️ Skip करो",
    ask_url: "🔗 *Link छोटी करो*\n\nवो URL भेजो जो छोटी करनी है:",
    ask_custom_code: "🔑 *Custom code चाहिए?*\nCode type करो (जैसे `mybrand`) या Skip करो:",
    ask_password: "🔒 *Password लगाना चाहते हो?*\nPassword type करो या Skip करो:",
    ask_edit_choice: "✏️ *क्या edit करना चाहते हो?*",
    ask_new_url: "📎 नया URL भेजो:",
    ask_new_code: "🔑 नया short code भेजो:",
    ask_new_password: "🔒 नया password भेजो (हटाने के लिए Skip करो):",
    edit_url_btn: "📎 URL बदलो",
    edit_code_btn: "🔑 Short Code बदलो",
    edit_pass_btn: "🔒 Password बदलो",
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
    not_yours: "❌ यह link आपकी नहीं है!",
    delete_confirm: (c) => `🗑️ *Delete करना चाहते हो?*\n\nCode: \`${c}\`\n\n⚠️ यह undo नहीं होगा!`,
    delete_yes: "✅ हाँ, Delete करो", delete_no: "❌ नहीं",
    deleted: (c) => `✅ *Delete हो गया!*\n\n\`${c}\` अब काम नहीं करेगा।`,
    delete_failed: "❌ Delete नहीं हुआ!",
    edited: (c, sh) => `✅ *Update हो गया!*\n\n🔗 \`${sh}\`\n📎 बदलाव save हो गए।`,
    bot_stats: (tl, tc, top) => `📊 *Bot Statistics*\n\n🔗 Total Links: *${tl}*\n👆 Total Clicks: *${tc}*\n\n🏆 *Top Links:*\n${top||"अभी कोई data नहीं"}`,
    not_admin: "❌ आप admin नहीं हैं!",
    banned: "🚫 आप इस bot को use करने से banned हैं!",
    cancelled: "❌ *रद्द हो गया!* Main menu पर वापस।",
    help: "❓ *koom.site Bot - Help*\n\n*Commands:*\n`/start` - Bot शुरू करो\n`/mylinks` - अपने links देखो\n`/admin` - Admin panel\n\n*Features:*\n• Custom short codes\n• Password protection\n• Click tracking\n• Edit / Delete links\n\n*Tip:* सीधे URL भेजो!",
    select_lang: "🌐 *अपनी भाषा चुनें:*",
    lang_set: "✅ भाषा हिंदी में सेट हो गई!",
    make_more: "🔗 और बनाओ", stats_btn: "📊 Stats",
    edit_btn: "✏️ Edit", delete_btn: "🗑️ Delete",
    prev: "⬅️ पिछला", next: "अगला ➡️",
    unknown: "❓ समझ नहीं आया। /help type करो या URL भेजो।",
    pass_removed: "🔓 Password हटा दिया गया।",
    code_updated: (c) => `✅ Short code \`${c}\` हो गया`,
  },
  ur: {
    welcome: (n) => `👋 *السلام علیکم ${n}!*\n\n🚀 *koom.site Link Shortener Bot*\n\nکسی بھی لمبے لنک کو ایک کلک میں چھوٹا کریں!\n\nنیچے سے آپشن چنیں 👇`,
    join_required: (ch) => `⚠️ *پہلے ہمارا چینل جوائن کریں!*\n\n📢 Channel: ${ch}\n\nجوائن کریں پھر /start کریں۔`,
    join_btn: "📢 چینل جوائن کریں", joined_btn: "✅ میں نے جوائن کر لیا",
    menu_shorten: "🔗 لنک چھوٹا کریں", menu_mylinks: "📋 میرے لنکس",
    menu_find: "🔍 لنک تلاش کریں", menu_stats: "📊 اعداد",
    menu_help: "❓ مدد", menu_lang: "🌐 زبان",
    cancel: "❌ منسوخ", back: "🔙 واپس", main_menu: "🏠 مین مینو", skip: "⏭️ چھوڑیں",
    ask_url: "🔗 *لنک چھوٹا کریں*\n\nوہ URL بھیجیں جو چھوٹا کرنا ہے:",
    ask_custom_code: "🔑 *کسٹم کوڈ چاہیے؟*\nکوڈ ٹائپ کریں یا Skip کریں:",
    ask_password: "🔒 *پاسورڈ لگانا چاہتے ہیں؟*\nپاسورڈ ٹائپ کریں یا Skip کریں:",
    ask_edit_choice: "✏️ *کیا edit کرنا چاہتے ہیں؟*",
    ask_new_url: "📎 نیا URL بھیجیں:", ask_new_code: "🔑 نیا short code بھیجیں:",
    ask_new_password: "🔒 نیا پاسورڈ بھیجیں (ہٹانے کے لیے Skip کریں):",
    edit_url_btn: "📎 URL بدلیں", edit_code_btn: "🔑 Short Code بدلیں", edit_pass_btn: "🔒 پاسورڈ بدلیں",
    invalid_url: "❌ درست URL نہیں! http:// سے شروع ہونی چاہیے",
    code_taken: "❌ یہ کوڈ پہلے سے لیا گیا ہے!",
    creating: "⏳ لنک بنا رہا ہوں...",
    link_created: (lk, sh) => `✅ *لنک بن گیا!*\n\n🔗 \`${sh}\`\n🔑 *کوڈ:* \`${lk.shortcode}\`\n🔒 *پاسورڈ:* ${lk.password?"ہاں ✅":"نہیں ❌"}`,
    link_stats: (lk, sh) => `📊 *لنک اعداد*\n\n🔗 \`${sh}\`\n👆 *کلکس:* ${lk.clicks||0}\n🔒 *پاسورڈ:* ${lk.password?"ہاں":"نہیں"}\n✅ *حالت:* ${lk.status}`,
    my_links_title: (p, tp) => `📋 *میرے لنکس* (صفحہ ${p}/${tp})`,
    no_links: "📋 ابھی کوئی لنک نہیں!", create_first: "🔗 لنک بنائیں",
    find_ask: "🔍 شارٹ کوڈ ٹائپ کریں:", not_found: "❌ لنک نہیں ملا!",
    not_yours: "❌ یہ لنک آپ کا نہیں!",
    delete_confirm: (c) => `🗑️ *ڈیلیٹ کریں؟*\n\`${c}\`\n⚠️ واپس نہیں ہوگا!`,
    delete_yes: "✅ ہاں ڈیلیٹ کریں", delete_no: "❌ نہیں",
    deleted: (c) => `✅ ڈیلیٹ ہو گیا! \`${c}\``,
    delete_failed: "❌ ڈیلیٹ نہیں ہوا!",
    edited: (c, sh) => `✅ *اپڈیٹ ہو گیا!*\n🔗 \`${sh}\``,
    bot_stats: (tl, tc, top) => `📊 *اعداد*\n\n🔗 کل لنکس: *${tl}*\n👆 کل کلکس: *${tc}*\n\n🏆 *ٹاپ:*\n${top||"کوئی ڈیٹا نہیں"}`,
    not_admin: "❌ آپ ایڈمن نہیں!", banned: "🚫 آپ ban ہیں!",
    cancelled: "❌ منسوخ! مین مینو پر واپس۔",
    help: "❓ *Help*\n\n`/start` بوٹ شروع\n`/mylinks` میرے لنکس\n\n*ٹپ:* URL بھیجیں!",
    select_lang: "🌐 زبان چنیں:", lang_set: "✅ اردو سیٹ!",
    make_more: "🔗 اور بنائیں", stats_btn: "📊 اعداد",
    edit_btn: "✏️ ایڈٹ", delete_btn: "🗑️ ڈیلیٹ",
    prev: "⬅️ پچھلا", next: "اگلا ➡️",
    unknown: "❓ سمجھ نہیں آیا۔ URL بھیجیں۔",
    pass_removed: "🔓 پاسورڈ ہٹا دیا۔", code_updated: (c) => `✅ کوڈ \`${c}\` ہو گیا`,
  },
  bn: {
    welcome: (n) => `👋 *স্বাগতম ${n}!*\n\n🚀 *koom.site Link Shortener Bot*\n\nযেকোনো লম্বা লিঙ্ক এক ক্লিকে ছোট করুন!\n\nনিচে থেকে অপশন বেছে নিন 👇`,
    join_required: (ch) => `⚠️ *প্রথমে আমাদের চ্যানেল জয়েন করুন!*\n\n📢 Channel: ${ch}\n\nজয়েন করুন তারপর /start করুন।`,
    join_btn: "📢 চ্যানেল জয়েন করুন", joined_btn: "✅ আমি জয়েন করেছি",
    menu_shorten: "🔗 লিঙ্ক ছোট করুন", menu_mylinks: "📋 আমার লিঙ্কস",
    menu_find: "🔍 লিঙ্ক খুঁজুন", menu_stats: "📊 পরিসংখ্যান",
    menu_help: "❓ সাহায্য", menu_lang: "🌐 ভাষা",
    cancel: "❌ বাতিল", back: "🔙 পিছনে", main_menu: "🏠 মেইন মেনু", skip: "⏭️ Skip করুন",
    ask_url: "🔗 *লিঙ্ক ছোট করুন*\n\nURL পাঠান:",
    ask_custom_code: "🔑 *কাস্টম কোড চাই?*\nকোড টাইপ করুন বা Skip করুন:",
    ask_password: "🔒 *পাসওয়ার্ড দিতে চান?*\nপাসওয়ার্ড টাইপ করুন বা Skip করুন:",
    ask_edit_choice: "✏️ *কী edit করতে চান?*",
    ask_new_url: "📎 নতুন URL পাঠান:", ask_new_code: "🔑 নতুন short code পাঠান:",
    ask_new_password: "🔒 নতুন পাসওয়ার্ড পাঠান (মুছতে Skip করুন):",
    edit_url_btn: "📎 URL বদলান", edit_code_btn: "🔑 Short Code বদলান", edit_pass_btn: "🔒 পাসওয়ার্ড বদলান",
    invalid_url: "❌ সঠিক URL নয়!", code_taken: "❌ এই কোড আগেই নেওয়া হয়েছে!",
    creating: "⏳ লিঙ্ক তৈরি হচ্ছে...",
    link_created: (lk, sh) => `✅ *লিঙ্ক তৈরি!*\n\n🔗 \`${sh}\`\n🔑 *কোড:* \`${lk.shortcode}\`\n🔒 *পাসওয়ার্ড:* ${lk.password?"হ্যাঁ ✅":"না ❌"}`,
    link_stats: (lk, sh) => `📊 *লিঙ্ক পরিসংখ্যান*\n\n🔗 \`${sh}\`\n👆 *ক্লিক:* ${lk.clicks||0}\n🔒 *পাসওয়ার্ড:* ${lk.password?"হ্যাঁ":"না"}`,
    my_links_title: (p, tp) => `📋 *আমার লিঙ্কস* (পৃষ্ঠা ${p}/${tp})`,
    no_links: "📋 এখনো কোনো লিঙ্ক নেই!", create_first: "🔗 লিঙ্ক তৈরি করুন",
    find_ask: "🔍 শর্ট কোড টাইপ করুন:", not_found: "❌ লিঙ্ক পাওয়া যায়নি!",
    not_yours: "❌ এই লিঙ্কটি আপনার নয়!",
    delete_confirm: (c) => `🗑️ *মুছে ফেলবেন?*\n\`${c}\`\n⚠️ পূর্বাবস্থায় ফেরানো যাবে না!`,
    delete_yes: "✅ হ্যাঁ মুছুন", delete_no: "❌ না",
    deleted: (c) => `✅ মুছে গেছে! \`${c}\``,
    delete_failed: "❌ মোছা ব্যর্থ!",
    edited: (c, sh) => `✅ *আপডেট হয়েছে!*\n🔗 \`${sh}\``,
    bot_stats: (tl, tc, top) => `📊 *পরিসংখ্যান*\n\n🔗 মোট: *${tl}*\n👆 ক্লিক: *${tc}*\n\n🏆 *শীর্ষ:*\n${top||"কোনো ডেটা নেই"}`,
    not_admin: "❌ আপনি এডমিন নন!", banned: "🚫 আপনি ban হয়েছেন!",
    cancelled: "❌ বাতিল! মেইন মেনুতে ফিরে গেছেন।",
    help: "❓ *সাহায্য*\n\n`/start` বট শুরু\n`/mylinks` আমার লিঙ্কস\n\n*টিপ:* সরাসরি URL পাঠান!",
    select_lang: "🌐 ভাষা বেছে নিন:", lang_set: "✅ বাংলা সেট!",
    make_more: "🔗 আরো তৈরি করুন", stats_btn: "📊 পরিসংখ্যান",
    edit_btn: "✏️ সম্পাদনা", delete_btn: "🗑️ মুছুন",
    prev: "⬅️ আগের", next: "পরের ➡️",
    unknown: "❓ বুঝতে পারিনি। URL পাঠান।",
    pass_removed: "🔓 পাসওয়ার্ড মুছে গেছে।", code_updated: (c) => `✅ কোড \`${c}\` হয়েছে`,
  },
  es: {
    welcome: (n) => `👋 *¡Hola ${n}!*\n\n🚀 *koom.site Link Shortener Bot*\n\n¡Acorta cualquier enlace!\n\nElige una opción 👇`,
    join_required: (ch) => `⚠️ *¡Únete a nuestro canal primero!*\n\n📢 Canal: ${ch}\n\nÚnete y luego /start.`,
    join_btn: "📢 Unirse al Canal", joined_btn: "✅ Ya me uní",
    menu_shorten: "🔗 Acortar enlace", menu_mylinks: "📋 Mis enlaces",
    menu_find: "🔍 Buscar enlace", menu_stats: "📊 Estadísticas",
    menu_help: "❓ Ayuda", menu_lang: "🌐 Idioma",
    cancel: "❌ Cancelar", back: "🔙 Atrás", main_menu: "🏠 Menú principal", skip: "⏭️ Omitir",
    ask_url: "🔗 *Acortar enlace*\n\nEnvía el URL:",
    ask_custom_code: "🔑 *¿Código personalizado?*\nEscribe tu código u Omitir:",
    ask_password: "🔒 *¿Añadir contraseña?*\nEscribe una contraseña u Omitir:",
    ask_edit_choice: "✏️ *¿Qué quieres editar?*",
    ask_new_url: "📎 Envía el nuevo URL:", ask_new_code: "🔑 Envía el nuevo código:",
    ask_new_password: "🔒 Envía la nueva contraseña (Omitir para eliminar):",
    edit_url_btn: "📎 Editar URL", edit_code_btn: "🔑 Editar Código", edit_pass_btn: "🔒 Editar Contraseña",
    invalid_url: "❌ URL no válido!", code_taken: "❌ ¡Código ya en uso!",
    creating: "⏳ Creando enlace...",
    link_created: (lk, sh) => `✅ *¡Enlace creado!*\n\n🔗 \`${sh}\`\n🔑 *Código:* \`${lk.shortcode}\`\n🔒 *Contraseña:* ${lk.password?"Sí ✅":"No ❌"}`,
    link_stats: (lk, sh) => `📊 *Estadísticas*\n\n🔗 \`${sh}\`\n👆 *Clics:* ${lk.clicks||0}\n🔒 *Contraseña:* ${lk.password?"Sí":"No"}`,
    my_links_title: (p, tp) => `📋 *Mis enlaces* (Página ${p}/${tp})`,
    no_links: "📋 ¡Aún no hay enlaces!", create_first: "🔗 Crear enlace",
    find_ask: "🔍 Escribe el código corto:", not_found: "❌ ¡Enlace no encontrado!",
    not_yours: "❌ ¡Este enlace no es tuyo!",
    delete_confirm: (c) => `🗑️ *¿Eliminar?*\n\`${c}\`\n⚠️ ¡No se puede deshacer!`,
    delete_yes: "✅ Sí, eliminar", delete_no: "❌ No",
    deleted: (c) => `✅ ¡Eliminado! \`${c}\``,
    delete_failed: "❌ ¡Error al eliminar!",
    edited: (c, sh) => `✅ *¡Actualizado!*\n🔗 \`${sh}\``,
    bot_stats: (tl, tc, top) => `📊 *Estadísticas*\n\n🔗 Total: *${tl}*\n👆 Clics: *${tc}*\n\n🏆 *Top:*\n${top||"Sin datos"}`,
    not_admin: "❌ ¡No eres administrador!", banned: "🚫 ¡Estás baneado!",
    cancelled: "❌ ¡Cancelado! De vuelta al menú.",
    help: "❓ *Ayuda*\n\n`/start` Iniciar\n`/mylinks` Mis enlaces\n\n*Consejo:* ¡Envía una URL directamente!",
    select_lang: "🌐 Selecciona idioma:", lang_set: "✅ ¡Español configurado!",
    make_more: "🔗 Crear otro", stats_btn: "📊 Stats",
    edit_btn: "✏️ Editar", delete_btn: "🗑️ Eliminar",
    prev: "⬅️ Anterior", next: "Siguiente ➡️",
    unknown: "❓ No entendí. Envía una URL.",
    pass_removed: "🔓 Contraseña eliminada.", code_updated: (c) => `✅ Código \`${c}\``,
  },
  ar: {
    welcome: (n) => `👋 *مرحباً ${n}!*\n\n🚀 *koom.site Link Shortener Bot*\n\nاختصر أي رابط طويل!\n\nاختر خياراً 👇`,
    join_required: (ch) => `⚠️ *انضم إلى قناتنا أولاً!*\n\n📢 القناة: ${ch}\n\nانضم ثم /start`,
    join_btn: "📢 انضم للقناة", joined_btn: "✅ لقد انضممت",
    menu_shorten: "🔗 اختصر رابطاً", menu_mylinks: "📋 روابطي",
    menu_find: "🔍 ابحث عن رابط", menu_stats: "📊 إحصائيات",
    menu_help: "❓ مساعدة", menu_lang: "🌐 اللغة",
    cancel: "❌ إلغاء", back: "🔙 رجوع", main_menu: "🏠 القائمة الرئيسية", skip: "⏭️ تخطي",
    ask_url: "🔗 *اختصر رابطاً*\n\nأرسل الرابط:",
    ask_custom_code: "🔑 *تريد رمزاً مخصصاً؟*\nاكتب الرمز أو تخطي:",
    ask_password: "🔒 *تريد كلمة مرور؟*\nاكتب كلمة المرور أو تخطي:",
    ask_edit_choice: "✏️ *ماذا تريد تعديله؟*",
    ask_new_url: "📎 أرسل الرابط الجديد:", ask_new_code: "🔑 أرسل الرمز الجديد:",
    ask_new_password: "🔒 أرسل كلمة المرور الجديدة (تخطي للحذف):",
    edit_url_btn: "📎 تعديل الرابط", edit_code_btn: "🔑 تعديل الرمز", edit_pass_btn: "🔒 تعديل كلمة المرور",
    invalid_url: "❌ الرابط غير صالح!", code_taken: "❌ الرمز مستخدم!",
    creating: "⏳ جاري الإنشاء...",
    link_created: (lk, sh) => `✅ *تم الإنشاء!*\n\n🔗 \`${sh}\`\n🔑 *الرمز:* \`${lk.shortcode}\`\n🔒 *كلمة المرور:* ${lk.password?"نعم ✅":"لا ❌"}`,
    link_stats: (lk, sh) => `📊 *إحصائيات*\n\n🔗 \`${sh}\`\n👆 *النقرات:* ${lk.clicks||0}\n🔒 *كلمة المرور:* ${lk.password?"نعم":"لا"}`,
    my_links_title: (p, tp) => `📋 *روابطي* (صفحة ${p}/${tp})`,
    no_links: "📋 لا توجد روابط!", create_first: "🔗 إنشاء رابط",
    find_ask: "🔍 اكتب الرمز القصير:", not_found: "❌ لم يتم العثور على الرابط!",
    not_yours: "❌ هذا الرابط ليس لك!",
    delete_confirm: (c) => `🗑️ *حذف؟*\n\`${c}\`\n⚠️ لا يمكن التراجع!`,
    delete_yes: "✅ نعم احذف", delete_no: "❌ لا",
    deleted: (c) => `✅ تم الحذف! \`${c}\``,
    delete_failed: "❌ فشل الحذف!",
    edited: (c, sh) => `✅ *تم التحديث!*\n🔗 \`${sh}\``,
    bot_stats: (tl, tc, top) => `📊 *إحصائيات*\n\n🔗 الروابط: *${tl}*\n👆 النقرات: *${tc}*\n\n🏆 *الأفضل:*\n${top||"لا بيانات"}`,
    not_admin: "❌ لست مسؤولاً!", banned: "🚫 أنت محظور!",
    cancelled: "❌ تم الإلغاء! عودة للقائمة.",
    help: "❓ *مساعدة*\n\n`/start` تشغيل\n`/mylinks` روابطي\n\n*نصيحة:* أرسل الرابط مباشرة!",
    select_lang: "🌐 اختر لغتك:", lang_set: "✅ تم تعيين العربية!",
    make_more: "🔗 إنشاء آخر", stats_btn: "📊 إحصائيات",
    edit_btn: "✏️ تعديل", delete_btn: "🗑️ حذف",
    prev: "⬅️ السابق", next: "التالي ➡️",
    unknown: "❓ لم أفهم. أرسل رابطاً.",
    pass_removed: "🔓 تم حذف كلمة المرور.", code_updated: (c) => `✅ الرمز \`${c}\``,
  }
};

function t(chatId, key, ...args) {
  const lang = userLang[chatId] || "en";
  const fn = (T[lang] && T[lang][key]) || T["en"][key];
  if (typeof fn === "function") return fn(...args);
  return fn || key;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function isValidUrl(url) { try { new URL(url); return true; } catch { return false; } }
function isAdmin(chatId) { return ADMIN_IDS.includes(String(chatId)); }
function shortUrl(code) { return BASE_URL + "/" + code; }
function generateCode() { return nanoid(6); }

// ─── CHANNEL CHECK ────────────────────────────────────────────────────────────
async function isUserInChannel(userId) {
  if (!CHANNEL_USERNAME) return true; // No channel set = skip check
  try {
    const member = await bot.getChatMember(CHANNEL_USERNAME, userId);
    return ["member", "administrator", "creator"].includes(member.status);
  } catch { return true; } // If error, allow through
}

// ─── DB FUNCTIONS ─────────────────────────────────────────────────────────────
async function isBanned(userId) {
  const { data } = await supabase.from("banned_users").select("user_id").eq("user_id", String(userId)).single();
  return !!data;
}

async function banUser(userId) {
  const { error } = await supabase.from("banned_users").insert({ user_id: String(userId), banned_at: new Date().toISOString() });
  return !error;
}

async function unbanUser(userId) {
  const { error } = await supabase.from("banned_users").delete().eq("user_id", String(userId));
  return !error;
}

async function createLink(longurl, customCode, password, userId) {
  const shortcode = customCode || generateCode();
  if (customCode) {
    const { data: ex } = await supabase.from("links").select("shortcode").eq("shortcode", customCode).single();
    if (ex) return { error: "code_taken" };
  }
  const { data, error } = await supabase.from("links").insert({
    shortcode, longurl, password: password || null,
    encrypted: !!password, status: "active",
    user_id: String(userId), source: "telegram"
  }).select().single();
  if (error) {
    const { data: d2, error: e2 } = await supabase.from("links").insert({
      shortcode, longurl, password: password || null,
      encrypted: !!password, status: "active", user_id: String(userId)
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

async function getUserLinkByCode(shortcode, userId) {
  const { data } = await supabase.from("links").select("*").eq("shortcode", shortcode).eq("status", "active").single();
  if (!data) return { status: "not_found" };
  if (!data.user_id) return { status: "not_yours" };
  if (data.user_id !== String(userId)) return { status: "not_yours" };
  return { status: "ok", link: data };
}

async function getUserLinks(userId, page) {
  const { data, count, error } = await supabase.from("links")
    .select("*", { count: "exact" })
    .eq("status", "active").eq("user_id", String(userId)).eq("source", "telegram")
    .order("createdat", { ascending: false })
    .range(page * 5, page * 5 + 4);
  if (error) {
    const { data: d2, count: c2 } = await supabase.from("links")
      .select("*", { count: "exact" })
      .eq("status", "active").eq("user_id", String(userId))
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

async function updateLinkUrl(shortcode, newUrl) {
  const { data, error } = await supabase.from("links")
    .update({ longurl: newUrl, updatedat: new Date().toISOString() })
    .eq("shortcode", shortcode).select().single();
  if (error) return { error: error.message };
  return { data };
}

async function updateLinkPassword(shortcode, newPassword) {
  const { data, error } = await supabase.from("links")
    .update({ password: newPassword || null, encrypted: !!newPassword, updatedat: new Date().toISOString() })
    .eq("shortcode", shortcode).select().single();
  if (error) return { error: error.message };
  return { data };
}

async function updateLinkCode(oldCode, newCode, userId) {
  const { data: ex } = await supabase.from("links").select("shortcode").eq("shortcode", newCode).single();
  if (ex) return { error: "code_taken" };
  const { data, error } = await supabase.from("links")
    .update({ shortcode: newCode, updatedat: new Date().toISOString() })
    .eq("shortcode", oldCode).eq("user_id", String(userId)).select().single();
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

async function getAdminStats() {
  const { count: totalLinks } = await supabase.from("links").select("*", { count: "exact", head: true }).eq("status", "active");
  const { count: totalDeleted } = await supabase.from("links").select("*", { count: "exact", head: true }).eq("status", "deleted");
  const { count: totalBanned } = await supabase.from("banned_users").select("*", { count: "exact", head: true });
  const { data: cd } = await supabase.from("links").select("clicks");
  const totalClicks = (cd || []).reduce((s, r) => s + (r.clicks || 0), 0);
  const { data: topLinks } = await supabase.from("links").select("shortcode, longurl, clicks, user_id")
    .eq("status", "active").order("clicks", { ascending: false }).limit(5);
  const { data: recentLinks } = await supabase.from("links").select("shortcode, longurl, user_id, createdat")
    .eq("status", "active").order("createdat", { ascending: false }).limit(5);
  const { data: bannedList } = await supabase.from("banned_users").select("user_id, banned_at").order("banned_at", { ascending: false }).limit(10);
  return { totalLinks, totalDeleted, totalBanned, totalClicks, topLinks: topLinks || [], recentLinks: recentLinks || [], bannedList: bannedList || [] };
}

// ─── KEYBOARDS ────────────────────────────────────────────────────────────────
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

function skipKb(chatId) {
  return { reply_markup: { inline_keyboard: [[{ text: t(chatId, "skip"), callback_data: "skip" }, { text: t(chatId, "cancel"), callback_data: "cancel" }]] } };
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

function editChoiceKb(chatId, shortcode) {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: t(chatId, "edit_url_btn"), callback_data: "editurl_" + shortcode }],
        [{ text: t(chatId, "edit_code_btn"), callback_data: "editcode_" + shortcode }],
        [{ text: t(chatId, "edit_pass_btn"), callback_data: "editpass_" + shortcode }],
        [{ text: t(chatId, "back"), callback_data: "lstats_" + shortcode }]
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

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────
function adminMenuKb() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📊 Full Stats", callback_data: "adm_stats" }, { text: "👥 Users", callback_data: "adm_users" }],
        [{ text: "🚫 Banned List", callback_data: "adm_banned" }, { text: "🔗 Recent Links", callback_data: "adm_recent" }],
        [{ text: "🏆 Top Links", callback_data: "adm_top" }, { text: "🗑️ Delete Link", callback_data: "adm_dellink" }],
        [{ text: "🔨 Ban User", callback_data: "adm_ban" }, { text: "✅ Unban User", callback_data: "adm_unban" }],
        [{ text: "📢 Broadcast", callback_data: "adm_broadcast" }, { text: "🔙 Main Menu", callback_data: "menu" }]
      ]
    }
  };
}

// ─── COMMANDS ─────────────────────────────────────────────────────────────────
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const name = msg.from.first_name || "User";
  userState[chatId] = null;

  if (!userLang[chatId]) {
    const tl = (msg.from.language_code || "en").substring(0, 2);
    userLang[chatId] = T[tl] ? tl : "en";
  }

  // Check if banned
  if (await isBanned(userId)) {
    return bot.sendMessage(chatId, t(chatId, "banned"));
  }

  // Check channel membership
  if (CHANNEL_USERNAME && !(await isUserInChannel(userId))) {
    return bot.sendMessage(chatId, t(chatId, "join_required", CHANNEL_USERNAME), {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: t(chatId, "join_btn"), url: `https://t.me/${CHANNEL_USERNAME.replace("@", "")}` }],
          [{ text: t(chatId, "joined_btn"), callback_data: "check_join" }]
        ]
      }
    });
  }

  bot.sendMessage(chatId, t(chatId, "welcome", name), { parse_mode: "Markdown", ...mainMenu(chatId) });
});

bot.onText(/\/help/, (msg) => sendHelp(msg.chat.id));
bot.onText(/\/mylinks/, (msg) => sendMyLinks(msg.chat.id, msg.from.id, 0));

bot.onText(/\/admin/, async (msg) => {
  const chatId = msg.chat.id;
  if (!isAdmin(chatId)) return bot.sendMessage(chatId, t(chatId, "not_admin"));
  bot.sendMessage(chatId, "🔧 *Admin Panel*\n\nKya karna chahte ho?", { parse_mode: "Markdown", ...adminMenuKb() });
});

bot.onText(/\/ban (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!isAdmin(chatId)) return bot.sendMessage(chatId, t(chatId, "not_admin"));
  const targetId = match[1].trim();
  const ok = await banUser(targetId);
  bot.sendMessage(chatId, ok ? `✅ User \`${targetId}\` banned!` : "❌ Ban failed!", { parse_mode: "Markdown" });
});

bot.onText(/\/unban (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!isAdmin(chatId)) return bot.sendMessage(chatId, t(chatId, "not_admin"));
  const targetId = match[1].trim();
  const ok = await unbanUser(targetId);
  bot.sendMessage(chatId, ok ? `✅ User \`${targetId}\` unbanned!` : "❌ Unban failed!", { parse_mode: "Markdown" });
});

// ─── MESSAGE HANDLER ──────────────────────────────────────────────────────────
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text;
  if (!text || text.startsWith("/")) return;
  if (!userLang[chatId]) userLang[chatId] = "en";

  if (await isBanned(userId)) return bot.sendMessage(chatId, t(chatId, "banned"));

  const state = userState[chatId];

  if (!state) {
    if (isValidUrl(text)) {
      userState[chatId] = { step: "awaiting_custom_code", data: { longurl: text } };
      return bot.sendMessage(chatId, t(chatId, "ask_custom_code"), { parse_mode: "Markdown", ...skipKb(chatId) });
    }
    return bot.sendMessage(chatId, t(chatId, "unknown"), mainMenu(chatId));
  }

  // ── Shorten flow ──
  if (state.step === "awaiting_url") {
    if (!isValidUrl(text)) return bot.sendMessage(chatId, t(chatId, "invalid_url"), cancelKb(chatId));
    userState[chatId] = { step: "awaiting_custom_code", data: { longurl: text } };
    return bot.sendMessage(chatId, t(chatId, "ask_custom_code"), { parse_mode: "Markdown", ...skipKb(chatId) });
  }

  if (state.step === "awaiting_custom_code") {
    const customCode = text.replace(/[^a-zA-Z0-9_-]/g, "") || null;
    userState[chatId] = { step: "awaiting_password", data: { ...state.data, customCode } };
    return bot.sendMessage(chatId, t(chatId, "ask_password"), { parse_mode: "Markdown", ...skipKb(chatId) });
  }

  if (state.step === "awaiting_password") {
    const password = text;
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

  // ── Edit flows ──
  if (state.step === "awaiting_edit_url") {
    if (!isValidUrl(text)) return bot.sendMessage(chatId, t(chatId, "invalid_url"), cancelKb(chatId));
    const { shortcode } = state.data;
    userState[chatId] = null;
    const result = await updateLinkUrl(shortcode, text);
    if (result.error) return bot.sendMessage(chatId, "❌ " + result.error);
    return bot.sendMessage(chatId, t(chatId, "edited", shortcode, shortUrl(shortcode)), { parse_mode: "Markdown", ...linkActionsKb(chatId, shortcode) });
  }

  if (state.step === "awaiting_edit_code") {
    const newCode = text.replace(/[^a-zA-Z0-9_-]/g, "");
    const { shortcode } = state.data;
    userState[chatId] = null;
    const result = await updateLinkCode(shortcode, newCode, userId);
    if (result.error === "code_taken") return bot.sendMessage(chatId, t(chatId, "code_taken"), cancelKb(chatId));
    if (result.error) return bot.sendMessage(chatId, "❌ " + result.error);
    return bot.sendMessage(chatId, t(chatId, "code_updated", newCode), { parse_mode: "Markdown", ...linkActionsKb(chatId, newCode) });
  }

  if (state.step === "awaiting_edit_password") {
    const { shortcode } = state.data;
    userState[chatId] = null;
    const result = await updateLinkPassword(shortcode, text);
    if (result.error) return bot.sendMessage(chatId, "❌ " + result.error);
    return bot.sendMessage(chatId, t(chatId, "edited", shortcode, shortUrl(shortcode)), { parse_mode: "Markdown", ...linkActionsKb(chatId, shortcode) });
  }

  // ── Find flow ──
  if (state.step === "awaiting_find_code") {
    userState[chatId] = null;
    const result = await getUserLinkByCode(text.trim(), userId);
    if (result.status === "not_found") return bot.sendMessage(chatId, t(chatId, "not_found"), mainMenu(chatId));
    if (result.status === "not_yours") return bot.sendMessage(chatId, t(chatId, "not_yours"), mainMenu(chatId));
    return bot.sendMessage(chatId, t(chatId, "link_stats", result.link, shortUrl(result.link.shortcode)), { parse_mode: "Markdown", ...linkActionsKb(chatId, result.link.shortcode) });
  }

  // ── Admin flows ──
  if (state.step === "adm_ban_input") {
    userState[chatId] = null;
    const ok = await banUser(text.trim());
    return bot.sendMessage(chatId, ok ? `✅ User \`${text.trim()}\` banned!` : "❌ Failed!", { parse_mode: "Markdown", ...adminMenuKb() });
  }

  if (state.step === "adm_unban_input") {
    userState[chatId] = null;
    const ok = await unbanUser(text.trim());
    return bot.sendMessage(chatId, ok ? `✅ User \`${text.trim()}\` unbanned!` : "❌ Failed!", { parse_mode: "Markdown", ...adminMenuKb() });
  }

  if (state.step === "adm_dellink_input") {
    userState[chatId] = null;
    const ok = await deleteLink(text.trim());
    return bot.sendMessage(chatId, ok ? `✅ Link \`${text.trim()}\` deleted!` : "❌ Failed!", { parse_mode: "Markdown", ...adminMenuKb() });
  }

  if (state.step === "adm_broadcast_input") {
    userState[chatId] = null;
    // Get all unique user_ids
    const { data: users } = await supabase.from("links").select("user_id").eq("source", "telegram").neq("user_id", null);
    const uniqueIds = [...new Set((users || []).map(u => u.user_id))];
    let sent = 0, failed = 0;
    const broadcastMsg = "📢 *Broadcast Message:*\n\n" + text;
    for (const uid of uniqueIds) {
      try {
        await bot.sendMessage(uid, broadcastMsg, { parse_mode: "Markdown" });
        sent++;
        await new Promise(r => setTimeout(r, 50)); // rate limit
      } catch { failed++; }
    }
    return bot.sendMessage(chatId, `📢 *Broadcast Done!*\n\n✅ Sent: ${sent}\n❌ Failed: ${failed}`, { parse_mode: "Markdown", ...adminMenuKb() });
  }
});

// ─── CALLBACK HANDLER ─────────────────────────────────────────────────────────
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const msgId = query.message.message_id;
  const data = query.data;
  bot.answerCallbackQuery(query.id).catch(() => {});
  if (!userLang[chatId]) userLang[chatId] = "en";

  const edit = (text, extra) => bot.editMessageText(text, { chat_id: chatId, message_id: msgId, parse_mode: "Markdown", ...extra });

  // ── Channel join check ──
  if (data === "check_join") {
    const joined = await isUserInChannel(userId);
    if (!joined) {
      return bot.answerCallbackQuery(query.id, { text: "❌ Abhi join nahi kiya! Pehle join karo.", show_alert: true });
    }
    if (await isBanned(userId)) return bot.sendMessage(chatId, t(chatId, "banned"));
    const name = query.from.first_name || "User";
    return edit(t(chatId, "welcome", name), mainMenu(chatId));
  }

  // ── Skip button ──
  if (data === "skip") {
    const state = userState[chatId];
    if (!state) return;

    if (state.step === "awaiting_custom_code") {
      userState[chatId] = { step: "awaiting_password", data: { ...state.data, customCode: null } };
      return edit(t(chatId, "ask_password"), { parse_mode: "Markdown", ...skipKb(chatId) });
    }

    if (state.step === "awaiting_password") {
      const { longurl, customCode } = state.data;
      userState[chatId] = null;
      const loadMsg = await bot.sendMessage(chatId, t(chatId, "creating"));
      const result = await createLink(longurl, customCode, null, userId);
      bot.deleteMessage(chatId, loadMsg.message_id).catch(() => {});
      if (result.error === "code_taken") return bot.sendMessage(chatId, t(chatId, "code_taken"), mainMenu(chatId));
      if (result.error) return bot.sendMessage(chatId, "❌ " + result.error, mainMenu(chatId));
      return bot.editMessageText(t(chatId, "link_created", result.data, shortUrl(result.data.shortcode)), {
        chat_id: chatId, message_id: msgId, parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: t(chatId, "stats_btn"), callback_data: "lstats_" + result.data.shortcode }, { text: t(chatId, "make_more"), callback_data: "shorten" }],
            [{ text: t(chatId, "main_menu"), callback_data: "menu" }]
          ]
        }
      });
    }

    if (state.step === "awaiting_edit_password") {
      const { shortcode } = state.data;
      userState[chatId] = null;
      await updateLinkPassword(shortcode, null);
      return edit(t(chatId, "pass_removed"), linkActionsKb(chatId, shortcode));
    }
  }

  // ── Main navigation ──
  if (data === "menu") { userState[chatId] = null; return edit("🏠 *Main Menu*", mainMenu(chatId)); }
  if (data === "cancel") { userState[chatId] = null; return edit(t(chatId, "cancelled"), mainMenu(chatId)); }

  if (data === "shorten") {
    userState[chatId] = { step: "awaiting_url", data: {} };
    return edit(t(chatId, "ask_url"), { parse_mode: "Markdown", ...cancelKb(chatId) });
  }

  if (data === "help") return sendHelp(chatId, msgId);
  if (data === "lang") return edit(t(chatId, "select_lang"), { parse_mode: "Markdown", ...langKb() });

  if (data.startsWith("setlang_")) {
    userLang[chatId] = data.replace("setlang_", "");
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
    return sendMyLinks(chatId, userId, parseInt(data.split("_")[1]) || 0, msgId);
  }

  if (data.startsWith("lstats_") || data.startsWith("linfo_")) {
    const code = data.replace("lstats_", "").replace("linfo_", "");
    const link = await getLinkByCode(code);
    if (!link) return bot.sendMessage(chatId, t(chatId, "not_found"));
    return edit(t(chatId, "link_stats", link, shortUrl(link.shortcode)), linkActionsKb(chatId, link.shortcode));
  }

  // ── Edit options ──
  if (data.startsWith("edit_")) {
    const code = data.replace("edit_", "");
    return edit(t(chatId, "ask_edit_choice"), editChoiceKb(chatId, code));
  }

  if (data.startsWith("editurl_")) {
    const code = data.replace("editurl_", "");
    userState[chatId] = { step: "awaiting_edit_url", data: { shortcode: code } };
    return edit(t(chatId, "ask_new_url"), cancelKb(chatId));
  }

  if (data.startsWith("editcode_")) {
    const code = data.replace("editcode_", "");
    userState[chatId] = { step: "awaiting_edit_code", data: { shortcode: code } };
    return edit(t(chatId, "ask_new_code"), cancelKb(chatId));
  }

  if (data.startsWith("editpass_")) {
    const code = data.replace("editpass_", "");
    userState[chatId] = { step: "awaiting_edit_password", data: { shortcode: code } };
    return edit(t(chatId, "ask_new_password"), { parse_mode: "Markdown", ...skipKb(chatId) });
  }

  // ── Delete ──
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

  // ── ADMIN CALLBACKS ──
  if (!isAdmin(chatId)) return;

  if (data === "adm_stats") {
    const s = await getAdminStats();
    const top = s.topLinks.map((l, i) => `${i+1}. \`${l.shortcode}\` - ${l.clicks}🖱️`).join("\n");
    const text = `🔧 *Admin Statistics*\n\n` +
      `🔗 Active Links: *${s.totalLinks}*\n` +
      `🗑️ Deleted Links: *${s.totalDeleted}*\n` +
      `👆 Total Clicks: *${s.totalClicks}*\n` +
      `🚫 Banned Users: *${s.totalBanned}*\n\n` +
      `🏆 *Top Links:*\n${top || "No data"}`;
    return edit(text, adminMenuKb());
  }

  if (data === "adm_users") {
    const { data: users } = await supabase.from("links").select("user_id").eq("source", "telegram").neq("user_id", null);
    const unique = [...new Set((users || []).map(u => u.user_id))];
    return edit(`👥 *Total Unique Users:* *${unique.length}*\n\nYeh woh users hain jinhone bot se links banaye hain.`, adminMenuKb());
  }

  if (data === "adm_banned") {
    const { data: bl } = await supabase.from("banned_users").select("user_id, banned_at").order("banned_at", { ascending: false }).limit(10);
    const list = (bl || []).map((u, i) => `${i+1}. \`${u.user_id}\``).join("\n");
    return edit(`🚫 *Banned Users:*\n\n${list || "Koi banned user nahi"}`, adminMenuKb());
  }

  if (data === "adm_recent") {
    const { data: recent } = await supabase.from("links").select("shortcode, user_id, createdat")
      .eq("status", "active").order("createdat", { ascending: false }).limit(8);
    const list = (recent || []).map((l, i) => `${i+1}. \`${l.shortcode}\` by \`${l.user_id||"web"}\``).join("\n");
    return edit(`🔗 *Recent Links:*\n\n${list || "No data"}`, adminMenuKb());
  }

  if (data === "adm_top") {
    const { data: top } = await supabase.from("links").select("shortcode, clicks, longurl")
      .eq("status", "active").order("clicks", { ascending: false }).limit(10);
    const list = (top || []).map((l, i) => `${i+1}. \`${l.shortcode}\` - ${l.clicks}🖱️`).join("\n");
    return edit(`🏆 *Top 10 Links:*\n\n${list || "No data"}`, adminMenuKb());
  }

  if (data === "adm_ban") {
    userState[chatId] = { step: "adm_ban_input" };
    return edit("🔨 *Ban User*\n\nUser ka Telegram ID bhejo:", cancelKb(chatId));
  }

  if (data === "adm_unban") {
    userState[chatId] = { step: "adm_unban_input" };
    return edit("✅ *Unban User*\n\nUser ka Telegram ID bhejo:", cancelKb(chatId));
  }

  if (data === "adm_dellink") {
    userState[chatId] = { step: "adm_dellink_input" };
    return edit("🗑️ *Delete Link*\n\nShort code bhejo jo delete karna hai:", cancelKb(chatId));
  }

  if (data === "adm_broadcast") {
    userState[chatId] = { step: "adm_broadcast_input" };
    return edit("📢 *Broadcast Message*\n\nVo message type karo jo saare users ko bhejna hai:", cancelKb(chatId));
  }
});

// ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────────
async function sendMyLinks(chatId, userId, page, editMsgId) {
  const { data: links, count } = await getUserLinks(userId, page);
  const totalPages = Math.max(1, Math.ceil(count / 5));

  if (!links || links.length === 0) {
    const text = t(chatId, "no_links");
    const opts = { parse_mode: "Markdown", reply_markup: { inline_keyboard: [[{ text: t(chatId, "create_first"), callback_data: "shorten" }], [{ text: t(chatId, "back"), callback_data: "menu" }]] } };
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
