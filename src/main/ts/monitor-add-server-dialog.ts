import { CSSResult, customElement, html } from 'lit-element';
import { style } from '../css/monitor-add-server-dialog.css';
import { MonitorButton } from './monitor-button';
import { MonitorDialog } from './monitor-dialog';
import { MonitorTextInput } from './monitor-text-input';
import { MonitorWarning } from './monitor-warning';

@customElement('monitor-add-server-dialog')
export class MonitorAddServerDialog extends MonitorDialog {

	constructor() {
		super({
			escClose: true,
			buttons: [
				{
					text: 'Ok',
					click: (event) => this.onOkButtonClicked(event)
				},
				{
					text: 'Cancel',
					click: (event) => this.onCancelButtonClicked(event)
				}
			]
		});

		this.title = 'Adicionar Novo Servidor';
		this.progress = 'hidden';
	}

	static get styles(): CSSResult {
		return style;
	}

	get body(){
		return html`
			<monitor-warning id='show_error' msg='' showError='no' ></monitor-warning>
			<monitor-text-input id="name" tabindex="1" type="text" label="Nome" class="validate" ></monitor-text-input>
			<monitor-text-input id="address" tabindex="2" type="text" label="Endereço"></monitor-text-input>
			<monitor-text-input id="port" tabindex="3" type="number" min="1" label="Porta"></monitor-text-input>
		`;
	}

	blockControls(block: boolean) {
		this.renderRoot.querySelectorAll<MonitorTextInput>('monitor-text-input')
			.forEach((element => {
				element.disabled = block;
			}));

		this.renderRoot.querySelectorAll<MonitorButton>('monitor-button')
			.forEach((element => {
				element.disabled = block;
			}));
	}

	onOkButtonClicked(event: Event) {
		//this.blockControls(true);

		const name = this.renderRoot.querySelector<MonitorTextInput>('#name').value,
			address = this.renderRoot.querySelector<MonitorTextInput>('#address').value,
			port = Number(this.renderRoot.querySelector<MonitorTextInput>('#port').value),
			show_error = this.renderRoot.querySelector<MonitorWarning>('monitor-warning#show_error'),
			newServer = languageClient.createMonitorServer();

		if (!name) {
			this.progress = 'hidden';
			this.blockControls(false);
			this.focus();
			this.renderRoot.querySelector<MonitorTextInput>('monitor-text-input#name').showRedLine('Nome inválido','text');
			show_error.showTheError("Nome de servidor inválido");

		}
		else if (!address){
			this.progress = 'hidden';
			this.blockControls(false);
			this.focus()
			this.renderRoot.querySelector<MonitorTextInput>('monitor-text-input#address').showRedLine('Endereço inválido','text');
			show_error.showTheError("Endereço de servidor inválido");
		}
		else if(!port){
			this.progress = 'hidden';
			this.blockControls(false);
			this.focus()
			this.renderRoot.querySelector<MonitorTextInput>('monitor-text-input#port').showRedLine('Porta inválida','text');
			show_error.showTheError("Porta de servidor inválida");
		}
		else {

			const listOfServers = JSON.parse(window.localStorage.getItem('settings'));
			let cantStoreValue = listOfServers.servers.filter(item => {
				return ((item.address == address && item.port == port) || item.name == name )});

			if(cantStoreValue.length > 0) {
				this.progress = 'hidden';
				this.blockControls(false);
				this.focus();
				show_error.showTheError("Dados de servidor já cadastrados");
			}
			else {

				this.blockControls(true);

				newServer.address = address;
				newServer.port = port;

				this.progress = 'visible';

				newServer.validate()
					.then((valid: boolean) => {
						this.progress = 'hidden';
						this.blockControls(false);

						if (!valid) {
							throw new Error('server.validate failed!');
						}

						const app = document.querySelector('monitor-app');

						app.addServer({
							name: name,
							server: newServer
						});

						this.close();
					})
					.catch((error: Error) => {
						console.error(error);

						this.progress = 'hidden';
						this.blockControls(false);
					});
			}

		}
	}

	onCancelButtonClicked(event: Event) {
		this.cancel();
	}

}

