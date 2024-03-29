export class GuidHelper {
	newGuid(): string {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
			// tslint:disable
			const r = (Math.random() * 16) | 0,
				v = c == 'x' ? r : (r & 0x3) | 0x8;
			return v.toString(16);
		});
	}

	shortGuid(): string {
		return 'xxxxxxxxx'.replace(/[xy]/g, (c) => {
			// tslint:disable
			const r = (Math.random() * 16) | 0,
				v = c == 'x' ? r : (r & 0x3) | 0x8;
			return v.toString(16);
		});
	}
}

export const guidHelper = new GuidHelper();
