const masterApiKey = localStorage.getItem("masterApiKey") || "";
const accessApiKey = localStorage.getItem("accessApiKey") || "";

if (masterApiKey) {
	document.body.classList.add('ismaster');
} else if (accessApiKey) {
	document.body.classList.add('isaccess');
}

const api = JSONBinAPI(accessApiKey || undefined, masterApiKey || undefined);

api.loadFromStorage();

let isEncryptionEnabled = false;
let lastId = localStorage.getItem("lastId.value") || '';
document.getElementById('createData').value = localStorage.getItem("createData.value") || '';
document.getElementById('retrieveId').value = lastId;
document.getElementById('updateId').value = lastId;
document.getElementById('updateData').value = localStorage.getItem("updateData.value") || '';
document.getElementById('deleteId').value = lastId;
document.getElementById('masterApiKey').value = masterApiKey;
document.getElementById('accessApiKey').value = accessApiKey;
const listEl = document.getElementById('listing');

function displayOutput(message, el) {
	(el || document.getElementById('output')).innerText = message;
}

async function toggleEncryption(enabled) {
	isEncryptionEnabled = enabled;
	await api.setAutoEncrypt(enabled);
	displayOutput(`Encryption ${enabled ? 'enabled' : 'disabled'}`);
}

function saveApiKeys() {
	const masterKey = document.getElementById('masterApiKey').value;
	const accessKey = document.getElementById('accessApiKey').value;
	localStorage.setItem("masterApiKey", masterKey);
	localStorage.setItem("accessApiKey", accessKey);
	location.reload();
}

function forgetApiKeys() {
	localStorage.removeItem("masterApiKey");
	localStorage.removeItem("accessApiKey");
	document.getElementById('masterApiKey').value = '';
	document.getElementById('accessApiKey').value = '';
	location.reload();
}

async function createBin() {
	const data = document.getElementById('createData').value;
	try {
		localStorage.setItem("createData.value", data);
		const record = JSON.parse(data);
		const result = await api.createStorageBin(isEncryptionEnabled ? await api.encrypt(record) : record);
		displayOutput(`Created Bin: ${JSON.stringify({ data, bin: result })}`);
		lastId = result.metadata.id;
		localStorage.setItem("lastId.value", lastId);
		document.getElementById('retrieveId').value = lastId;
		document.getElementById('updateId').value = lastId;
		document.getElementById('deleteId').value = lastId;
		displayOutput(JSON.stringify(await api.listBinIds(), undefined, 4), listEl);
	} catch (error) {
		displayOutput(`Error: ${error.message}`);
	}
}

async function retrieveBin() {
	lastId = document.getElementById('retrieveId').value;
	try {
		localStorage.setItem("lastId.value", lastId);
		let result = await api.retrieveStorageBin(lastId);
		if (isEncryptionEnabled && result.record && result.record.e && result.record.iv) {
			result.record = await api.decrypt(result.record);
		}
		displayOutput(`Retrieved Bin: ${JSON.stringify(result)}`);
		displayOutput(JSON.stringify(await api.listBinIds(), undefined, 4), listEl);
	} catch (error) {
		displayOutput(`Error: ${error.message}`);
	}
}

async function updateBin() {
	lastId = document.getElementById('updateId').value;
	const data = document.getElementById('updateData').value;
	try {
		localStorage.setItem("lastId.value", lastId);
		localStorage.setItem("updateData.value", data);
		const record = JSON.parse(data);
		const result = await api.updateStorageBin(lastId, isEncryptionEnabled ? await api.encrypt(record) : record);
		displayOutput(`Updated Bin: ${JSON.stringify(result)}`);
		displayOutput(JSON.stringify(await api.listBinIds(), undefined, 4), listEl);
	} catch (error) {
		displayOutput(`Error: ${error.message}`);
	}
}

async function deleteBin() {
	const id = document.getElementById('deleteId').value;
	try {
		localStorage.setItem("lastId.value", id);
		const result = await api.deleteStorageBin(id);
		displayOutput(`Deleted Bin: ${JSON.stringify(result)}`);
		const listing = await api.listBinIds();
		displayOutput(JSON.stringify(listing, undefined, 4), listEl);
		if (listing.length > 0) {
			const newId = listing[listing.length - 1].record;
			document.getElementById('retrieveId').value = newId;
			document.getElementById('updateId').value = newId;
			document.getElementById('deleteId').value = newId;
		}
	} catch (error) {
		displayOutput(`Error: ${error.message}`);
	}
}
