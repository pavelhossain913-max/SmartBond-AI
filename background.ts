declare const chrome: any;
const ACTIONS: Record<string,string> = {explain:"Explain",summarize:"Summarize",translate:"Translate",rewrite:"Rewrite",grammar:"Improve grammar",questions:"Generate questions",explain_bn:"Explain in Bengali"};
chrome.runtime.onInstalled.addListener(()=>{
  chrome.sidePanel.setPanelBehavior({openPanelOnActionClick:true});
  for(const [id,t] of Object.entries(ACTIONS)) chrome.contextMenus.create({id,title:`SmartBond: ${t}`,contexts:["selection"]});
});
// Selected text is passed only when the user clicks a menu item.
chrome.contextMenus.onClicked.addListener(async (info:any,tab:any)=>{
  await chrome.storage.session.set({pending:{mode:info.menuItemId,text:info.selectionText}});
  await chrome.sidePanel.open({tabId:tab.id});
});
