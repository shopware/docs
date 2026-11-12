{ pkgs, lib, config, ... }:

{
    languages.javascript.enable = true;
    languages.javascript.package = pkgs.nodejs_22;
    languages.javascript.pnpm.enable = true;
}
