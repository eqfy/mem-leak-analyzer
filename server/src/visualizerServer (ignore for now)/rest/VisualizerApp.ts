import VisualizerServer from './VisualizerServer';

export class VisualizerApp {
	public initServer(port: number) {
		const server = new VisualizerServer(port);
		return server.start().catch((err: Error) => {
			console.error(`VisualizerApp::initServer() - ERROR: ${err.message}`);
		});
	}
}
