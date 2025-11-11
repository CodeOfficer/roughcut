#!/usr/bin/env bash
# Helper script to build tutorials with different modes
# Usage: ./scripts/build-tutorial.sh <name> <mode>
#    or: TUTORIAL=<name> ./scripts/build-tutorial.sh <mode>
# Modes: fast (skip images/audio), full (all AI), html (HTML only)

set -e

# Support both positional args and environment variable
if [ -n "$TUTORIAL" ]; then
  TUTORIAL_NAME="$TUTORIAL"
  BUILD_MODE="${1:-fast}"
else
  TUTORIAL_NAME="$1"
  BUILD_MODE="${2:-fast}"
fi

if [ -z "$TUTORIAL_NAME" ]; then
  echo "Error: Tutorial name is required"
  echo "Usage: $0 <name> <mode>"
  echo "   or: TUTORIAL=<name> $0 <mode>"
  echo "  name: Tutorial name (e.g., demo, mcp-server)"
  echo "  mode: fast (default), full, html"
  exit 1
fi

INPUT="tutorials/${TUTORIAL_NAME}/presentation.md"
OUTPUT="tutorials/${TUTORIAL_NAME}/output"

# Check if input file exists
if [ ! -f "$INPUT" ]; then
  echo "Error: Input file not found: $INPUT"
  echo "Available tutorials:"
  find tutorials -mindepth 2 -maxdepth 2 -name "presentation.md" -exec dirname {} \; | sed 's|tutorials/||'
  exit 1
fi

echo "Building tutorial: $TUTORIAL_NAME (mode: $BUILD_MODE)"
echo "Input:  $INPUT"
echo "Output: $OUTPUT"
echo ""

# Build based on mode
case "$BUILD_MODE" in
  fast)
    echo "Mode: Fast (skipping images and audio)"
    direnv exec . tsx src/cli/index.ts build -i "$INPUT" -o "$OUTPUT" --skip-images --skip-audio
    ;;
  full)
    echo "Mode: Full (with AI images and audio)"
    direnv exec . tsx src/cli/index.ts build -i "$INPUT" -o "$OUTPUT"
    ;;
  html)
    echo "Mode: HTML only (no video)"
    direnv exec . tsx src/cli/index.ts build -i "$INPUT" -o "$OUTPUT" --skip-images --skip-audio --no-video
    ;;
  *)
    echo "Error: Invalid mode '$BUILD_MODE'"
    echo "Valid modes: fast, full, html"
    exit 1
    ;;
esac

echo ""
echo "✓ Build complete!"
echo "  Presentation: $OUTPUT/presentation/index.html"
[ "$BUILD_MODE" != "html" ] && echo "  Video:        $OUTPUT/tutorial.mp4"
