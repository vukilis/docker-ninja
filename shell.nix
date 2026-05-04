{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  name = "docker-ninja-web-env";

  buildInputs = with pkgs; [
    nodejs_22
    nodePackages.pnpm # Faster and more efficient than npm
  ];

  shellHook = ''
    echo "DockerNinja Web Environment Loaded."
    echo "Node version: $(node -v)"
  '';
}