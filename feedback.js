"use strict";
const SUBMIT_URL = "https://script.google.com/macros/s/AKfycbw89E6JQ1z4mcfdAEOd9qpg3KHgFh5Pjd8n_esFkg6lXh7dQogU2RepuAPAeqIbriIw/exec";
const I18N = {
  "ar": {
    "pageTitle": "تقييم الفعالية | معاً نحمي",
    "campaignFooter": "معاً نحمي",
    "toggle": "English",
    "toggleLabel": "Switch to English",
    "title1": "شكراً",
    "title2": "لحضوركم",
    "intro": "سعدنا بمشاركتكم اليوم. رأيكم يساعدنا على تقديم تجربة أفضل في الفعاليات القادمة — لن يستغرق الأمر أكثر من دقيقة.",
    "detailsLabel": "بياناتك",
    "name": "الاسم",
    "namePh": "اكتب اسمك",
    "empId": "الرقم الوظيفي",
    "empIdPh": "مثال: 102345",
    "ratingLabel": "التقييم",
    "q1": "ما مدى رضاك عن الفعالية بشكل عام؟",
    "q1Low": "غير راضٍ",
    "q1High": "راضٍ جداً",
    "q2": "ما مدى استفادتك من محتوى الفعالية؟",
    "q2Low": "محدودة",
    "q2High": "كبيرة جداً",
    "q3": "كيف تقيّم تنظيم الفعالية؟",
    "q3Low": "ضعيف",
    "q3High": "ممتاز",
    "required": "يرجى اختيار تقييم",
    "comment": "تعليقات أو اقتراحات",
    "commentPh": "شاركنا ما أعجبك أو ما يمكن تحسينه…",
    "submit": "إرسال التقييم",
    "sending": "جارٍ الإرسال…",
    "privacy": "تُستخدم إجاباتك لأغراض تحسين الفعاليات فقط.",
    "doneTitle": "شكراً لمشاركتك",
    "doneText": "تم إرسال مشاركتك. شكراً لمساعدتنا في تحسين فعالياتنا.",
    "error": "تعذّر التأكد من إرسال الطلب. حاول مرة أخرى أو امسح رمز QR.",
    "of5": "من 5",
    "scanTitle": "تفضّل التقييم من هاتفك؟",
    "scanText": "امسح الرمز وشاركنا رأيك من جهازك الشخصي.",
    "backHome": "العودة للترحيب",
    "privateNote": "لا يلزم إدخال بياناتك. تُمسح إجاباتك من هذه الشاشة بعد الانتهاء أو عند تركها دون استخدام.",
    "idleTitle": "هل ما زلت هنا؟",
    "idleText": "لحماية خصوصيتك، ستُمسح إجاباتك من الشاشة بعد قليل.",
    "continueSession": "متابعة التقييم",
    "finishSession": "إنهاء ومسح البيانات",
    "returnNote": "ستعود الشاشة إلى صفحة الترحيب خلال ثوانٍ.",
    "limitError": "يرجى اختصار البيانات أو التعليق والمحاولة مجدداً."
  },
  "en": {
    "pageTitle": "Event Feedback | Together We Protect",
    "campaignFooter": "Together We Protect",
    "toggle": "عربي",
    "toggleLabel": "التبديل إلى العربية",
    "title1": "Thank you",
    "title2": "for joining us",
    "intro": "We were glad to have you today. Your feedback helps us make future events even better — it takes less than a minute.",
    "detailsLabel": "Your details",
    "name": "Name",
    "namePh": "Enter your name",
    "empId": "Employee ID",
    "empIdPh": "e.g. 102345",
    "ratingLabel": "Your rating",
    "q1": "How satisfied are you with the event overall?",
    "q1Low": "Not satisfied",
    "q1High": "Very satisfied",
    "q2": "How useful was the event content for you?",
    "q2Low": "Slightly",
    "q2High": "Extremely",
    "q3": "How would you rate the event organization?",
    "q3Low": "Poor",
    "q3High": "Excellent",
    "required": "Please select a rating",
    "comment": "Comments or suggestions",
    "commentPh": "Tell us what you liked or what we could improve…",
    "submit": "Submit feedback",
    "sending": "Sending…",
    "privacy": "Your answers are used only to improve our events.",
    "doneTitle": "Thank you for your feedback",
    "doneText": "Your response has been sent. Thank you for helping us improve.",
    "error": "We could not confirm the request was sent. Please try again or scan the QR code.",
    "of5": "of 5",
    "scanTitle": "Prefer your phone?",
    "scanText": "Scan to share your feedback on your own device.",
    "backHome": "Back to welcome",
    "privateNote": "Your details are not required. This screen clears your answers after you finish or leave it idle.",
    "idleTitle": "Still there?",
    "idleText": "For your privacy, this screen will clear your answers shortly.",
    "continueSession": "Keep going",
    "finishSession": "Finish and clear",
    "returnNote": "This screen will return to the welcome page in a few seconds.",
    "limitError": "Please shorten your details or comment and try again."
  }
};
const params = new URLSearchParams(location.search);
const kiosk = params.get("kiosk") === "1";
const IDLE_MS = 90000;
const WARNING_MS = 20000;
const SUCCESS_MS = 10000;
const REQUEST_MS = 20000;
const form = document.getElementById("feedback");
const btn = document.getElementById("submitBtn");
const toggle = document.getElementById("langToggle");
const welcome = document.getElementById("welcome");
const idleDialog = document.getElementById("idleDialog");
const sendError = document.getElementById("sendError");
let lang = "en";
let screen = "form";
let sending = false;
let generation = 0;
let controller = null;
let lastActivity = Date.now();
let warningDeadline = 0;
let successTimer = null;

function applyLang(next) {
  lang = Object.hasOwn(I18N, next) ? next : "en";
  const t = I18N[lang];
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.title = t.pageTitle;
  document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t[el.dataset.i18n]; });
  document.querySelectorAll("[data-i18n-ph]").forEach(el => { el.placeholder = t[el.dataset.i18nPh]; });
  document.querySelectorAll(".scale label").forEach(el => el.setAttribute("aria-label", el.textContent + " " + t.of5));
  toggle.querySelector("span").textContent = t.toggle;
  toggle.setAttribute("aria-label", t.toggleLabel);
  toggle.lang = lang === "ar" ? "en" : "ar";
  if (sending) btn.textContent = t.sending;
  if (!sendError.hidden) sendError.textContent = t.error;
}
function setBusy(value) {
  sending = value;
  btn.disabled = value;
  toggle.disabled = value;
  form.setAttribute("aria-busy", String(value));
  form.querySelectorAll("input,textarea").forEach(el => { el.disabled = value; });
  btn.textContent = value ? I18N[lang].sending : I18N[lang].submit;
}
function clearForm() {
  form.reset();
  form.querySelectorAll('input[type="text"],textarea').forEach(el => { el.value = ""; });
  document.querySelectorAll(".question").forEach(el => el.classList.remove("invalid"));
  sendError.hidden = true;
  sendError.textContent = "";
}
function closeWarning() {
  if (idleDialog.open) idleDialog.close();
  warningDeadline = 0;
}
function showWelcome() {
  if (!kiosk) return;
  generation++;
  if (controller) controller.abort();
  controller = null;
  clearTimeout(successTimer);
  closeWarning();
  setBusy(false);
  clearForm();
  screen = "welcome";
  document.body.dataset.screen = screen;
  document.body.classList.remove("done");
  document.body.classList.add("welcoming");
  welcome.hidden = false;
  applyLang("en");
  window.scrollTo({top: 0, behavior: "instant"});
  document.getElementById("startKiosk").focus({preventScroll:true});
}
function startSession() {
  generation++;
  clearForm();
  screen = "form";
  document.body.dataset.screen = screen;
  welcome.hidden = true;
  document.body.classList.remove("welcoming", "done");
  lastActivity = Date.now();
  window.scrollTo({top: 0, behavior: "instant"});
  toggle.focus({preventScroll:true});
}
document.querySelectorAll(".question").forEach(q => {
  const key = q.dataset.q;
  const legend = q.querySelector("legend");
  legend.id = "question-" + key;
  const scale = q.querySelector(".scale");
  scale.setAttribute("aria-labelledby", legend.id);
  for (let i = 1; i <= 5; i++) {
    const id = key + "-" + i;
    const input = document.createElement("input");
    input.type = "radio"; input.name = key; input.id = id; input.value = String(i);
    const label = document.createElement("label");
    label.htmlFor = id; label.textContent = String(i);
    scale.append(input,label);
  }
  scale.addEventListener("change", () => q.classList.remove("invalid"));
});
toggle.addEventListener("click", () => applyLang(lang === "ar" ? "en" : "ar"));
document.body.classList.toggle("kiosk", kiosk);
applyLang(Object.hasOwn(I18N, params.get("lang")) ? params.get("lang") : "en");
if (kiosk) {
  // Do not persist visitor data or language in a shared browser.
  form.querySelectorAll("input,textarea").forEach(el => {
    el.setAttribute("autocomplete","off");
    el.setAttribute("spellcheck","false");
  });
  document.getElementById("startKiosk").addEventListener("click",startSession);
  ["backWelcome","finishKiosk","clearKiosk"].forEach(id => document.getElementById(id).addEventListener("click",showWelcome));
  document.getElementById("continueKiosk").addEventListener("click",() => {
    closeWarning(); lastActivity = Date.now();
  });
  idleDialog.addEventListener("cancel",e => {
    e.preventDefault(); closeWarning(); lastActivity = Date.now();
  });
  ["pointerdown","keydown","input"].forEach(event => document.addEventListener(event,() => {
    if (screen === "form" && !idleDialog.open && !sending) lastActivity = Date.now();
  },{passive:true}));
  setInterval(() => {
    if (screen !== "form" || sending) return;
    const now = Date.now();
    if (warningDeadline) {
      if (now >= warningDeadline) { showWelcome(); return; }
      document.getElementById("idleCountdown").textContent = String(Math.ceil((warningDeadline-now)/1000));
    } else if (now-lastActivity >= IDLE_MS) {
      warningDeadline = now+WARNING_MS;
      document.getElementById("idleCountdown").textContent = String(WARNING_MS/1000);
      idleDialog.showModal();
      document.getElementById("continueKiosk").focus();
    }
  },1000);
  document.addEventListener("visibilitychange",() => { if (document.hidden) showWelcome(); });
  window.addEventListener("pagehide",showWelcome);
  window.addEventListener("pageshow",e => { if (e.persisted) showWelcome(); });
  showWelcome();
}
function spreadsheetText(value) {
  const text = value.trim();
  // Defense in depth for spreadsheet exports; the receiver must also validate.
  return /^[=+@-]/.test(text) ? "'" + text : text;
}
form.addEventListener("submit",async e => {
  e.preventDefault();
  if (sending || screen !== "form") return;
  sendError.hidden = true;
  let firstInvalid = null;
  document.querySelectorAll(".question").forEach(q => {
    const answered = q.querySelector("input:checked");
    q.classList.toggle("invalid",!answered);
    if (!answered && !firstInvalid) firstInvalid = q;
  });
  if (firstInvalid) {
    firstInvalid.scrollIntoView({behavior:"auto",block:"center"});
    firstInvalid.querySelector("input").focus({preventScroll:true});
    return;
  }
  const values = Object.fromEntries(new FormData(form));
  if (values.name.length>100 || values.employee_id.length>40 || values.comment.length>2000) {
    sendError.textContent = I18N[lang].limitError; sendError.hidden = false; return;
  }
  const data = {
    name: spreadsheetText(values.name),
    employee_id: spreadsheetText(values.employee_id),
    comment: spreadsheetText(values.comment),
    overall: values.overall, content: values.content, organization: values.organization
  };
  if (![data.overall,data.content,data.organization].every(v => /^[1-5]$/.test(v))) return;
  data.language = lang;
  data.campaign = "Cybersecurity";
  data.submitted_at = new Date().toISOString();
  setBusy(true);
  const thisGeneration = generation;
  const request = new AbortController();
  controller = request;
  const requestTimer = setTimeout(() => request.abort(),REQUEST_MS);
  try {
    await fetch(SUBMIT_URL,{
      method:"POST",mode:"no-cors",credentials:"omit",referrerPolicy:"no-referrer",
      headers:{"Content-Type":"text/plain;charset=utf-8"},
      body:JSON.stringify(data),signal:request.signal
    });
    if (thisGeneration !== generation) return;
    // An opaque no-cors response confirms dispatch, not storage in Google Sheets.
    clearForm();
    setBusy(false);
    screen = "success";
    document.body.dataset.screen = screen;
    document.body.classList.add("done");
    window.scrollTo({top:0,behavior:"auto"});
    const heading = document.querySelector(".success h2");
    heading.tabIndex = -1;
    heading.focus({preventScroll:true});
    if (kiosk) successTimer = setTimeout(showWelcome,SUCCESS_MS);
  } catch (error) {
    if (thisGeneration !== generation) return;
    setBusy(false);
    lastActivity = Date.now();
    sendError.textContent = I18N[lang].error;
    sendError.hidden = false;
    sendError.scrollIntoView({behavior:"auto",block:"center"});
  } finally {
    clearTimeout(requestTimer);
    if (controller === request) controller = null;
  }
});
