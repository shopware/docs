{ pkgs, lib, config, ... }:

{
    languages.javascript.enable = true;
    languages.javascript.package = pkgs.nodejs-18_x;
    languages.javascript.pnpm.enable = true;
}
