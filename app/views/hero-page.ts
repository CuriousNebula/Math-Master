import { NavigatedData, Page } from '@nativescript/core';
import { HeroViewModel } from '../viewmodels/hero-view-model';

export function onNavigatingTo(args: NavigatedData) {
    const page = <Page>args.object;
    page.bindingContext = new HeroViewModel();
}