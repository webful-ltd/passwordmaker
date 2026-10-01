declare module '@webful/passwordmaker-lib' {
	interface PasswordOptions {
		charset: string;
		data?: string;
		hashAlgorithm: string;
		l33tLevel?: number;
		length: number;
		masterPassword: string;
		modifier?: string;
		prefix?: string;
		suffix?: string;
		whereToUseL33t?: 'never' | 'none' | 'before-hashing' | 'after-hashing' | 'both';
		username?: string;
	}

	export default function makePassword(options: PasswordOptions): string;
}

declare module '2ldcheck' {
	export default function isSecondLevelDomain(domain: string): boolean;
}
