/**
 * QDC workshop registration endpoint (Google Apps Script web app).
 *
 * Receives sign-ups from https://quantumfau.github.io/workshop.html,
 * writes one row per registration to the "QDC Workshop Registrations" sheet,
 * and emails the person a confirmation.
 * Also handles club sign-ups (form=join from /join.html): writes to the
 * "QDC Member Sign-ups" sheet and emails the group-chat link.
 *
 * Deploy: Deploy > New deployment > Web app
 *   Execute as: Me   |   Who has access: Anyone
 * After editing, use Deploy > Manage deployments > Edit > New version
 * so the /exec URL stays the same.
 */

const SHEET_ID = '1MTSE7CkgeINEdxeo22GF70tlpbpd5xscYdiUttscH18';
const REPLY_TO = 'qdc.fau@outlook.com';

/* Club sign-ups (form=join from https://quantumfau.github.io/join.html) */
const JOIN_SHEET_ID = '1lb3_F0qScm9gUFqCJ4xJcZh1qL_PX9jL1__CcO3zSEk';
const GROUP_CHAT_URL = 'https://chat.whatsapp.com/LAW8ps6Jjb59WcjlVSt32g';
const SITE_URL = 'https://quantumfau.github.io';

const EVENT = {
  id: 'classiq-2026-11-13',
  title: 'Hands-On Quantum Programming Workshop',
  host: 'Quantum Development Club × Classiq',
  speaker: 'Amit Bhattacharyya, Quantum Solutions Architect, Classiq',
  when: 'Friday, November 13, 2026, 3:00 – 4:30 PM ET',
  where: 'The Trading Room, BU 101, College of Business, FAU Boca Raton',
  page: 'https://quantumfau.github.io/workshop.html',
  // Google Calendar link (times in UTC: 3:00–4:30 PM EST = 20:00–21:30 UTC)
  calendar: 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=' + encodeURIComponent('Hands-On Quantum Programming Workshop (QDC × Classiq)') +
    '&dates=20261113T200000Z/20261113T213000Z' +
    '&location=' + encodeURIComponent('The Trading Room, BU 101, College of Business, FAU Boca Raton') +
    '&details=' + encodeURIComponent('Free hands-on workshop led by Amit Bhattacharyya (Classiq). Bring a laptop. https://quantumfau.github.io/workshop.html')
};

function doGet() {
  return json_({ ok: true, service: 'qdc-workshop-registration', event: EVENT.id });
}

function doPost(e) {
  const p = (e && e.parameter) || {};
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    if (p.form === 'join') return handleJoin_(p);
    const name = clean_(p.full_name || p.name);
    const email = clean_(p.email).toLowerCase();
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json_({ ok: false, error: 'Please include your full name and a valid email.' });
    }

    const sh = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    const last = sh.getLastRow();
    const emails = last > 1 ? sh.getRange(2, 3, last - 1, 1).getValues().map(r => String(r[0]).toLowerCase()) : [];
    const repeat = emails.indexOf(email) !== -1;

    let sent = 'Yes';
    try {
      sendConfirmation_(name, email);
    } catch (err) {
      sent = 'Failed: ' + err.message;
    }

    sh.appendRow([
      new Date(), name, email,
      clean_(p.status), clean_(p.major), clean_(p.experience), clean_(p.laptop), clean_(p.question),
      clean_(p.event) || EVENT.id,
      sent + (repeat ? ' (repeat sign-up)' : '')
    ]);

    return json_({ ok: true, emailed: sent === 'Yes', repeat: repeat });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

function sendConfirmation_(name, email) {
  const first = name.split(' ')[0];
  const subject = "You're registered: " + EVENT.title + ' (Fri, Nov 13)';
  const text = [
    'Hi ' + first + ',',
    '',
    "You're registered for the " + EVENT.title + '!',
    '',
    'When:  ' + EVENT.when,
    'Where: ' + EVENT.where,
    'Led by: ' + EVENT.speaker,
    '',
    'Please bring a laptop. No quantum or physics background needed.',
    '',
    'Add it to your calendar: ' + EVENT.calendar,
    'Event page: ' + EVENT.page,
    '',
    'Questions? Just reply to this email.',
    '',
    'See you there,',
    'Quantum Development Club at FAU'
  ].join('\n');

  const html =
    '<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#111">' +
      '<div style="background:#000;border-radius:16px;padding:28px 28px 24px;color:#f5f5f7">' +
        '<div style="font-size:13px;letter-spacing:.08em;color:#9aa4b2;text-transform:uppercase">' + EVENT.host + '</div>' +
        '<div style="font-size:26px;font-weight:800;margin-top:8px;line-height:1.2">You&#8217;re registered!</div>' +
        '<div style="font-size:18px;font-weight:700;margin-top:6px;background:linear-gradient(100deg,#8f5cff,#3f9bff 46%,#22e6ff);-webkit-background-clip:text;color:#6aa8ff">' + EVENT.title + '</div>' +
      '</div>' +
      '<p style="font-size:15px;line-height:1.5;margin:22px 4px 8px">Hi ' + esc_(first) + ', thanks for signing up. Here are the details:</p>' +
      '<table style="font-size:15px;line-height:1.5;margin:0 4px 16px;border-collapse:collapse">' +
        row_('When', EVENT.when) + row_('Where', EVENT.where) + row_('Led by', EVENT.speaker) + row_('Bring', 'A laptop (no quantum background needed)') +
      '</table>' +
      '<p style="margin:0 4px 22px"><a href="' + EVENT.calendar + '" style="display:inline-block;background:#3f6dff;color:#fff;text-decoration:none;font-weight:700;padding:11px 18px;border-radius:999px">Add to Google Calendar</a></p>' +
      '<p style="font-size:13px;color:#666;margin:0 4px">Questions? Just reply to this email. &middot; <a href="' + EVENT.page + '" style="color:#3f6dff">Event page</a></p>' +
      '<p style="font-size:13px;color:#666;margin:6px 4px 0">Quantum Development Club at FAU &middot; @fauquantum</p>' +
    '</div>';

  MailApp.sendEmail({
    to: email,
    subject: subject,
    body: text,
    htmlBody: html,
    name: 'FAU Quantum Development Club',
    replyTo: REPLY_TO
  });
}

function handleJoin_(p) {
  const name = clean_(p.full_name || p.name);
  const email = clean_(p.email).toLowerCase();
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json_({ ok: false, error: 'Please include your full name and a valid email.' });
  }
  const sh = SpreadsheetApp.openById(JOIN_SHEET_ID).getSheets()[0];
  const last = sh.getLastRow();
  const emails = last > 1 ? sh.getRange(2, 3, last - 1, 1).getValues().map(r => String(r[0]).toLowerCase()) : [];
  const repeat = emails.indexOf(email) !== -1;

  let sent = 'Yes';
  try { sendJoinEmail_(name, email); } catch (err) { sent = 'Failed: ' + err.message; }

  sh.appendRow([new Date(), name, email, clean_(p.status), clean_(p.major), clean_(p.interests), clean_(p.heard),
    sent + (repeat ? ' (repeat sign-up)' : '')]);
  return json_({ ok: true, emailed: sent === 'Yes', repeat: repeat });
}

function sendJoinEmail_(name, email) {
  const first = name.split(' ')[0];
  const subject = 'Welcome to the Quantum Development Club! Here is your group chat link';
  const text = [
    'Hi ' + first + ',',
    '',
    'Welcome to the Quantum Development Club at Florida Atlantic University!',
    '',
    'Join our group chat here: ' + GROUP_CHAT_URL,
    'That is where we post workshops, hackathons, conferences and project teams first.',
    '',
    'Upcoming events: ' + SITE_URL + '/events.html',
    'Instagram: @fauquantum',
    '',
    'No quantum background needed. Every major is welcome. Questions? Just reply to this email.',
    '',
    'See you soon,',
    'Quantum Development Club at FAU'
  ].join('\n');
  const html =
    '<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#111">' +
      '<div style="background:#000;border-radius:16px;padding:28px 28px 24px;color:#f5f5f7">' +
        '<div style="font-size:13px;letter-spacing:.08em;color:#9aa4b2;text-transform:uppercase">Quantum Development Club at FAU</div>' +
        '<div style="font-size:26px;font-weight:800;margin-top:8px;line-height:1.2">Welcome, ' + esc_(first) + '!</div>' +
        '<div style="font-size:16px;margin-top:6px;color:#c9d3e0">You&#8217;re in. Here&#8217;s your link to the club group chat.</div>' +
      '</div>' +
      '<p style="margin:24px 4px 10px"><a href="' + GROUP_CHAT_URL + '" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:999px">Join the group chat</a></p>' +
      '<p style="font-size:15px;line-height:1.55;margin:14px 4px">The group chat is where we post workshops, hackathons, conferences and project teams first. No quantum background needed, and every major is welcome.</p>' +
      '<p style="font-size:15px;line-height:1.55;margin:0 4px 18px"><a href="' + SITE_URL + '/events.html" style="color:#3f6dff">See upcoming events</a> &middot; Instagram <b>@fauquantum</b></p>' +
      '<p style="font-size:13px;color:#666;margin:0 4px">Questions? Just reply to this email.</p>' +
      '<p style="font-size:13px;color:#666;margin:6px 4px 0">Quantum Development Club at FAU &middot; ' + SITE_URL.replace('https://','') + '</p>' +
    '</div>';
  MailApp.sendEmail({ to: email, subject: subject, body: text, htmlBody: html, name: 'FAU Quantum Development Club', replyTo: REPLY_TO });
}

/* One-time setup for the member sheet: Eastern time, header, remove test rows. Safe to re-run. */
function setupJoinSheet() {
  const ss = SpreadsheetApp.openById(JOIN_SHEET_ID);
  ss.setSpreadsheetTimeZone('America/New_York');
  const sh = ss.getSheets()[0];
  sh.setName('Members');
  sh.setFrozenRows(1);
  sh.getRange(1, 1, 1, sh.getLastColumn()).setFontWeight('bold');
  sh.getRange('A:A').setNumberFormat('m/d/yyyy h:mm am/pm');
  for (let r = sh.getLastRow(); r >= 2; r--) {
    if (String(sh.getRange(r, 2).getValue()).indexOf('TEST - delete me') === 0) sh.deleteRow(r);
  }
}

function row_(k, v) {
  return '<tr><td style="padding:3px 14px 3px 0;color:#666;vertical-align:top;white-space:nowrap">' + k +
    '</td><td style="padding:3px 0;font-weight:600">' + esc_(v) + '</td></tr>';
}
function esc_(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
/* Trim, cap length, and keep text from being read as a spreadsheet formula. */
function clean_(s) {
  return String(s || '').replace(/\s+/g, ' ').trim().replace(/^[=+\-@\t\r]+/, '').trim().slice(0, 600);
}
function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/* Run once from the editor to grant permissions and send yourself a sample email. */
function testSendToMe() {
  sendConfirmation_('Test Owl', Session.getActiveUser().getEmail());
}

/* One-time setup: Eastern time, bold/frozen header, remove test rows. Safe to re-run. */
function setupSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  ss.setSpreadsheetTimeZone('America/New_York');
  const sh = ss.getSheets()[0];
  sh.setName('Registrations');
  sh.setFrozenRows(1);
  sh.getRange(1, 1, 1, sh.getLastColumn()).setFontWeight('bold');
  sh.getRange('A:A').setNumberFormat('m/d/yyyy h:mm am/pm');
  for (let r = sh.getLastRow(); r >= 2; r--) {
    if (String(sh.getRange(r, 2).getValue()).indexOf('TEST - delete me') === 0) sh.deleteRow(r);
  }
}
