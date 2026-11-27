{ inputs, pkgs, ... }:

let
    nodePkgs = import inputs.nixpkgs-node {
        system = pkgs.stdenv.hostPlatform.system;
    };
in
{
    languages.javascript.enable = true;
    languages.javascript.package = nodePkgs.nodejs_26;
    languages.javascript.pnpm.enable = true;
    languages.javascript.pnpm.package = nodePkgs.pnpm_12;
}
