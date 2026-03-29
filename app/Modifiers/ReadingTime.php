<?php

namespace App\Modifiers;

use Statamic\Modifiers\Modifier;

class ReadingTime extends Modifier
{
    public function index($value)
    {
        if (is_array($value)) {
            $text = collect($value)
                ->filter(fn($block) => ($block['type'] ?? '') === 'text_block')
                ->pluck('content')
                ->join(' ');
        } else {
            $text = (string) $value;
        }

        $words = str_word_count(strip_tags($text));
        $minutes = (int) ceil($words / 260);

        return max(1, $minutes);
    }
}
