<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTimeoutersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('timeouters', function (Blueprint $table) {
            $table->id();
            $table->string('shop');
            $table->string('script_file');
            $table->integer('id_tag');
            $table->string('title');
            $table->string('description');
            $table->string('discount_code');
            $table->tinyInteger('duration');
            $table->string('display_scope');
            $table->tinyInteger('theme');
            $table->tinyInteger('status');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('timeouters');
    }
}
