import { Observable } from '@nativescript/core';
import { Frame } from '@nativescript/core';

export class HeroViewModel extends Observable {
    constructor() {
        super();
    }

    onTopicTap(args) {
        const button = args.object;
        const topic = button.text.toLowerCase();
        Frame.topmost().navigate({
            moduleName: `views/quiz/${topic}-page`,
            transition: {
                name: 'slide',
                duration: 300,
                curve: 'easeInOut'
            }
        });
    }

    onDailyChallengeTap() {
        Frame.topmost().navigate({
            moduleName: 'views/daily-challenge-page',
            transition: {
                name: 'slide',
                duration: 300,
                curve: 'easeInOut'
            }
        });
    }

    onGameModeTap() {
        Frame.topmost().navigate({
            moduleName: 'views/game-mode-page',
            transition: {
                name: 'slide',
                duration: 300,
                curve: 'easeInOut'
            }
        });
    }
}