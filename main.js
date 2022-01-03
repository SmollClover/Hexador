const version = '0.0.1-dev';
const chalk = require('chalk');

if (process.platform !== 'win32') {
	console.log('Dieses Program läuft nur auf Windows Betriebssystemen.');
	process.exit(1);
}

console.clear();
console.log(
	chalk.magenta(String.raw`                          _            
  /\  /\_____  ____ _  __| | ___  _ __ 
 / /_/ / _ \ \/ / _' |/ _' |/ _ \| '__|
/ __  /  __/>  < (_| | (_| | (_) | |
\/ /_/ \___/_/\_\__,_|\__,_|\___/|_|`)
);
console.log(chalk.grey`                                    v${version}\n`);

const os = require('os');
const fs = require('fs');
const fse = require('fs-extra');
const brotli = require('brotli');
const inquirer = require('inquirer');

const UTF8 = require('utf8');
const Base64 = require('base-64');
const enc = require('crypto-js/enc-utf8');
const AES = require('crypto-js/aes');
const RC4 = require('crypto-js/rc4');
const Rabbit = require('crypto-js/rabbit');
const SHA1 = require('crypto-js/sha1');
const SHA3 = require('crypto-js/sha3');
const SHA224 = require('crypto-js/sha224');
const SHA256 = require('crypto-js/sha256');
const SHA384 = require('crypto-js/sha384');
const SHA512 = require('crypto-js/sha512');

const brotliSettings = {
	mode: 1,
	quality: 11
};

function main() {
	if (process.argv[2]) {
		if (process.argv[2].endsWith('.hexador')) {
			qLog('Entschlüsselungsprozess gestartet');
			console.log('');

			let data;
			try {
				if (!fs.existsSync(process.argv[2])) {
					eLog(
						'Fehler beim lesen der Datei ' +
						chalk.grey(process.argv[2])
					);
					return key2Exit();
				}
				data = fs.readFileSync(process.argv[2]);
			} catch {
				eLog(
					'Fehler beim lesen der Datei ' + chalk.grey(process.argv[2])
				);
				return key2Exit();
			}

			inquirer
				.prompt([
					{
						type: 'password',
						name: 'password',
						message: 'Bitte gebe das Passwort an:'
					}
				])
				.then((answers) => {
					if (!answers.password) {
						return eLog('Passwort darf nicht leer sein');
					}

					cLog('Entschlüssele Datei...');
					let output = decrypt(data, answers.password);

					if (output[0] === 0) {
						try {
							let newFile = process.argv[2].split('\\');
							newFile[newFile.length - 1] = newFile[
							newFile.length - 1
								].replace('.hexador', '');
							newFile = newFile.join('\\');

							cLog('Schreibe Datei...');
							fse.ensureFileSync(newFile);
							fs.writeFileSync(newFile, output[1]);

							gLog('Fertig');
							key2Exit();
						} catch (e) {
							eLog('Fehler');
							console.log(e);
							return key2Exit();
						}
					} else {
						eLog(
							'Fehler beim entschlüsseln der Datei ' +
							chalk.grey(output[0])
						);
						cLog(output[1]);
						if (output[2]) console.log(output[2]);
						return key2Exit();
					}
				});
		} else {
			qLog('Verschlüsselungsprozess gestartet');
			console.log('');

			let data;
			try {
				if (!fs.existsSync(process.argv[2])) {
					eLog(
						'Fehler beim lesen der Datei ' +
						chalk.grey(process.argv[2])
					);
					return key2Exit();
				}
				data = fs.readFileSync(process.argv[2]);
			} catch {
				eLog(
					'Fehler beim lesen der Datei ' + chalk.grey(process.argv[2])
				);
				return key2Exit();
			}

			inquirer
				.prompt([
					{
						type: 'password',
						name: 'password',
						message: 'Bitte gebe das Passwort an:'
					}
				])
				.then((answers) => {
					if (!answers.password) {
						return eLog('Passwort darf nicht leer sein');
					}

					cLog('Verschlüssele Datei...');
					let output = encrypt(data, answers.password);

					if (output[0] === 0) {
						try {
							let newFile = process.argv[2].split('\\');
							newFile[newFile.length - 1] = newFile[
							newFile.length - 1
								] + '.hexador';
							newFile = newFile.join('\\');

							cLog('Schreibe Datei...');
							fse.ensureFileSync(newFile);
							fs.writeFileSync(newFile, output[1]);

							gLog('Fertig');
							key2Exit();
						} catch (e) {
							eLog('Fehler');
							console.log(e);
							return key2Exit();
						}
					} else {
						eLog(
							'Fehler beim verschlüsseln der Datei ' +
							chalk.grey(output[0])
						);
						cLog(output[1]);
						if (output[2]) console.log(output[2]);
						return key2Exit();
					}
				});
		}
	} else {
		inquirer
			.prompt([
				{
					type: 'list',
					name: 'action',
					message: 'Was möchtest du tun?',
					choices: [
						'Entschlüsseln 🔑',
						'Verschlüsseln 🔐',
						new inquirer.Separator(),
						'Informationen 📜'
					]
				},
				{
					type: 'input',
					name: 'file',
					message: 'Datei / Datei Pfad:'
				}
			])
			.then((answers) => {
			});
	}
}

function encrypt(data, pass) {
	if (!data || !pass) return;

	try {
		pass = UTF8.encode(pass);
		let checksum = Base64.encode('Hexador');
		data = Base64.encode(data);

		let output = {
			header: {
				version: version,
				author: os.userInfo().username.toString(),
				timestamp: new Date(),
				method: ''
			},
			data: {
				checksum: '',
				content: ''
			}
		};

		for (let i = 0; i < 12; i++) {
			switch (Math.floor(Math.random() * 6)) {
				case 0:
					pass = SHA1(pass).toString();
					output.header.method += '1';
					break;
				case 1:
					pass = SHA3(pass).toString();
					output.header.method += '3';
					break;
				case 2:
					pass = SHA224(pass).toString();
					output.header.method += '2';
					break;
				case 3:
					pass = SHA256(pass).toString();
					output.header.method += '6';
					break;
				case 4:
					pass = SHA384(pass).toString();
					output.header.method += '8';
					break;
				case 5:
					pass = SHA512(pass).toString();
					output.header.method += '5';
					break;
			}
		}

		output.header.method += '+';

		for (let i = 0; i < 5; i++) {
			switch (Math.floor(Math.random() * 3)) {
				case 0:
					data = Base64.encode(AES.encrypt(data, pass).toString());
					checksum = Base64.encode(
						AES.encrypt(checksum, pass).toString()
					);
					output.header.method += 'A';
					break;
				case 1:
					data = Base64.encode(Rabbit.encrypt(data, pass).toString());
					checksum = Base64.encode(
						Rabbit.encrypt(checksum, pass).toString()
					);
					output.header.method += 'R';
					break;
				case 2:
					data = Base64.encode(RC4.encrypt(data, pass).toString());
					checksum = Base64.encode(
						RC4.encrypt(checksum, pass).toString()
					);
					output.header.method += '4';
					break;
			}
		}

		output.data.content = data;
		output.data.checksum = checksum;
		pass = undefined;
		data = undefined;
		checksum = undefined;
		return [
			0,
			brotli.compress(
				Buffer.from(JSON.stringify(output)),
				brotliSettings
			)
		];
	} catch (e) {
		return [1, 'Unbekannter Fehler', e];
	}
}

function decrypt(data, pass) {
	if (!data || !pass) return;

	try {
		data = JSON.parse(Buffer.from(brotli.decompress(data)).toString());
	} catch (e) {
		return [666, 'Korrupte Datenstruktur', e];
	}

	if (!data.header) return [120, 'Keine Hexador Datei'];
	if (!data.header.method) return [121, 'Keine Hexador Datei'];

	try {
		pass = UTF8.encode(pass);
		let checksum = data.data.checksum;
		let method1 = data.header.method.split('+')[0].split('');
		let method2 = data.header.method.split('+')[1].split('').reverse();
		data = data.data.content;

		for (let i = 0; i < method1.length; i++) {
			switch (method1[i]) {
				case '1':
					pass = SHA1(pass).toString();
					break;
				case '3':
					pass = SHA3(pass).toString();
					break;
				case '2':
					pass = SHA224(pass).toString();
					break;
				case '6':
					pass = SHA256(pass).toString();
					break;
				case '8':
					pass = SHA384(pass).toString();
					break;
				case '5':
					pass = SHA512(pass).toString();
					break;
			}
		}

		try {
			for (let i = 0; i < method2.length; i++) {
				switch (method2[i]) {
					case 'A':
						data = AES.decrypt(Base64.decode(data), pass).toString(enc);
						checksum = AES.decrypt(
							Base64.decode(checksum),
							pass
						).toString(enc);
						break;
					case 'R':
						data = Rabbit.decrypt(Base64.decode(data), pass).toString(
							enc
						);
						checksum = Rabbit.decrypt(
							Base64.decode(checksum),
							pass
						).toString(enc);
						break;
					case '4':
						data = RC4.decrypt(Base64.decode(data), pass).toString(enc);
						checksum = RC4.decrypt(
							Base64.decode(checksum),
							pass
						).toString(enc);
						break;
				}
			}
		} catch {
			pass = undefined;
			return [420, 'Password nicht korrekt'];
		}

		pass = undefined;
		if (Base64.decode(checksum) !== 'Hexador') {
			return [999, 'Checksum nicht korrekt'];
		}
		return [0, Base64.decode(data)];
	} catch (e) {
		return [1, 'Unbekannter Fehler', e];
	}
}

function key2Exit() {
	wLog('Drücke eine beliebige Taste um das Program zu beenden');
	process.stdin.setRawMode(true);
	process.stdin.resume();
	process.stdin.on('data', process.exit.bind(process, 0));
}

function cLog(message) {
	return console.log(chalk.cyan('~ ') + message);
}

function gLog(message) {
	return console.log(chalk.green('> ') + message);
}

function qLog(message) {
	return console.log(
		chalk.magentaBright('~# ') + message + chalk.magentaBright(' #~')
	);
}

function wLog(message) {
	return console.log(chalk.yellow('§ ') + message);
}

function eLog(message) {
	return console.log(chalk.red('! ') + message);
}

main();
