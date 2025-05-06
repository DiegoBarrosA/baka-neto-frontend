{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs = { nixpkgs, ... }:
    let
      eachSystem = f:
        nixpkgs.lib.genAttrs nixpkgs.lib.systems.flakeExposed
        (system: f nixpkgs.legacyPackages.${system});
    in {
      devShells = eachSystem (pkgs: {
        default = pkgs.mkShell {
          packages = [
            pkgs.chromium
            pkgs.nodejs_20
            pkgs.corepack
            pkgs.nodePackages.typescript
            pkgs.nodePackages.typescript-language-server
          ];

          # Add environment variables here
          env = {
            # Set CHROME_BIN to the path of the chromium executable
            # Nix automatically resolves pkgs.chromium to its store path
            # and the executable is typically in its bin/ subdirectory.
            CHROME_BIN = "${pkgs.chromium}/bin/chromium";
          };
        };
      });
    };
}
