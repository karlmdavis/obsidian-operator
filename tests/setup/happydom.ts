// Happy-DOM setup for testing
import { GlobalRegistrator } from "@happy-dom/global-registrator";

// Register happy-dom global APIs
GlobalRegistrator.register({
	url: "http://localhost:3000",
	width: 1920,
	height: 1080,
});
