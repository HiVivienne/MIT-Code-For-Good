function getPresent() {
    const attendanceSpreadsheetUrl ='https://docs.google.com/spreadsheets/d/1Lp0Z8_3JvsdEd9AlqRUE9VbdLejwKeFQWh1PfGwnk_Q/edit#gid=0'; // todo change this
    const ss = SpreadsheetApp.openByUrl(attendanceSpreadsheetUrl).getSheets()[1];
  
    let i = 17;
    let value = String(ss.getRange('D' +i).getValue());
    while (value.length > 0) {
      i += 1;
      value = String(ss.getRange('D'+i).getValue());
    }
    let names = ss.getRange('D17:E' + (i-1)).getValues(); 
  
    let present = [];
    for (let i = 0; i < names.length; i++) {
      if (names[i][1] === 'H'|| names[i][1] === 'T') {
        present.push(names[i][0])
      }
    }
  
    return present; 
  }
  
  
  function getNotResponded(){
    const formResponseUrl = 'https://docs.google.com/spreadsheets/d/1wzrAzQOYC8qMVFRFq3qN9ZM0LDoE3JGkif6MngVCQKY/edit#gid=527640571'; // todo change this
    const ss = SpreadsheetApp.openByUrl(formResponseUrl);
  
    let i = 2;
    let value = String(ss.getRange('A'+i).getValue());
    while (value.length > 0) {
      i += 1;
      value = String(ss.getRange('A'+i).getValue());
    }
    let timestamps = ss.getRange('A2:C'+(i-1)).getValues();
  
    const today = new Date();
    let last48hours = [];
    for (let i=0; i < timestamps.length; i++) {
      let t = timestamps[i];
      let difference = (today.getTime() - t[0].getTime())/(3.6 * 10**6);
      if (difference < 48) {
        last48hours.push(t);
      }
    }
    
    let namesSubmitted = [];
    for (row of last48hours) {
      namesSubmitted.push(row[2]);
    }
    
    let notSubmitted = [];
    let presentPeople = getPresent();
    for (person of presentPeople) {
      if (!namesSubmitted.includes(person)) {
        notSubmitted.push(person);
      }
    }
    return notSubmitted;
  }
  
  
  function getEmails() {
    const emailSpreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1lsp4XFGxO50veGs3UZAZCgtU964mLaSvl2BgPkATkHE/edit#gid=0'; // todo change this
    const ss = SpreadsheetApp.openByUrl(emailSpreadsheetUrl).getSheets()[0];
  
    let i = 2;
    let value = String(ss.getRange('A'+i).getValue());
    while (value.length > 0) {
      i += 1;
      value = String(ss.getRange('A'+i).getValue());
    }
    const allEmails = ss.getRange('A2:B'+(i-1)).getValues();
    const notSubmitted = getNotResponded();
    let emails = [];
    for (person of notSubmitted) {
      for (let i=0; i < allEmails.length; i++) {
        if (person === allEmails[i][0]) {
          emails.push(allEmails[i][1]);
          break;
        }
      }
    }
    return emails;
  }
  
  
  function showSubjectPrompt() {
    let ui = SpreadsheetApp.getUi();
    let defSubject = 'Reminder to fill out the survey!';
  
    let emailSubject = ui.prompt(
      'Enter the email\'s subject',
      'Leave blank for default: ' + defSubject,
      ui.ButtonSet.OK_CANCEL);
  
    let button = emailSubject.getSelectedButton();
    let text = emailSubject.getResponseText();
    if (button == ui.Button.OK) {
      if (text.length == 0) {
        return defSubject;
      } else {
        return text;
      }
    } else {
      return null;
    }
  }
  
  
  function showBodyPrompt() {
    let ui = SpreadsheetApp.getUi();
    let defBody = 'form link';
  
    let emailBody = ui.prompt(
        'Enter the email\'s body',
        'Leave blank for default: ' + defBody,
        ui.ButtonSet.OK_CANCEL);
  
    let button = emailBody.getSelectedButton();
    let text = emailBody.getResponseText();
    if (button == ui.Button.OK) {
      if (text.length == 0) {
        return defBody;
      } else {
        return text;
      }
    } else {
      return null;
    }
  }
  
  
  function sendEmails() {
    let values = getEmails();
  
    let subject = showSubjectPrompt();
    if (subject === null) return;
  
    let body = showBodyPrompt();
    if (body === null) return;
  
    for (email of values) {
      Logger.log("Sending email to " + email + "...");
      MailApp.sendEmail(email, subject, body);
      Logger.log("Sent!");
    }
  }
  
  
  function run() {
    sendEmails();
  }