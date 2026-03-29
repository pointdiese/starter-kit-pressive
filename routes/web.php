<?php

use Illuminate\Support\Facades\Route;
use Statamic\Facades\Taxonomy;
use Statamic\Facades\Term;

Route::statamic('/search', 'search');
Route::statamic('/authors', 'authors/index', ['title' => 'Authors']);
Route::statamic('/sitemap.xml', 'sitemap', ['content_type' => 'xml', 'layout' => false]);
Route::statamic('/robots.txt', 'robots', ['content_type' => 'text/plain', 'layout' => false]);
Route::statamic('/feed.xml', 'feed', ['content_type' => 'application/rss+xml', 'layout' => false, 'feed_url' => '/feed.xml']);

if (Taxonomy::find('categories')) {
    Term::whereTaxonomy('categories')->each(function ($term) {
        Route::statamic('/' . $term->slug() . '/feed.xml', 'feed', [
            'content_type'   => 'application/rss+xml',
            'layout'         => false,
            'feed_url'       => '/' . $term->slug() . '/feed.xml',
            'feed_category'  => $term->slug(),
            'category_title' => $term->get('title'),
        ]);
    });

    // Register a route for each category term dynamically.
    // Adding a new category in the CP automatically creates its route.
    Term::whereTaxonomy('categories')->each(function ($term) {
        Route::statamic('/' . $term->slug(), 'categories', [
            'title' => $term->get('title'),
            'slug'  => $term->slug(),
        ]);
    });
}
