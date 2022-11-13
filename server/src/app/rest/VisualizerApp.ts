import VisualizerServer from './Server';

export class VisualizerApp {
	public initServer(port: number) {
		const server = new VisualizerServer(port);
		return server.start().catch((err: Error) => {
			console.error(`App::initServer() - ERROR: ${err.message}`);
		});
	}
}
