import * as mod from 'hltv';
console.log('Keys:', Object.keys(mod));
console.log('Default:', mod.default);
if (mod.HLTV) console.log('HLTV export found');
if (mod.default && mod.default.createInstance) console.log('HLTV default instance might be needed');
