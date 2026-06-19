{ pkgs ? import (fetchTarball "https://github.com/NixOS/nixpkgs/archive/nixpkgs-unstable.tar.gz") {} }:

pkgs.mkShell {
  name = "docker-ninja-web-env";

  buildInputs = with pkgs; [
    nodejs_22
    pnpm # Faster and more efficient than npm
  ];

  shellHook = ''
    echo "DockerNinja Web Environment Loaded."
    echo "Node version: $(node -v)"
    echo "pnpm version: $(pnpm -v)"
  '';
}