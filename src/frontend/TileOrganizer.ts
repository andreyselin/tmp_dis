class TileOrganizer {
    // this is index instead of length
    static MAX_TILES = 3;
    static LOCAL_VIDEO_INDEX = 2;
    private tiles: { [id: number]: number } = {};
    public tileStates: {[id: number]: boolean } = {};

    acquireTileIndex(tileId: number, isLocalTile: boolean): number {
        for (let index = 0; index <= TileOrganizer.MAX_TILES; index++) {
            if (this.tiles[index] === tileId) {
                return index;
            }
        }
        for (let index = 0; index <= TileOrganizer.MAX_TILES; index++) {
            if (!(index in this.tiles)) {
                if (isLocalTile) {
                    this.tiles[TileOrganizer.LOCAL_VIDEO_INDEX] = tileId;
                    return TileOrganizer.LOCAL_VIDEO_INDEX;
                }
                this.tiles[index] = tileId;
                return index;
            }
        }
        throw new Error('no tiles are available');
    }

    releaseTileIndex(tileId: number): number {
        for (let index = 0; index <= TileOrganizer.MAX_TILES; index++) {
            if (this.tiles[index] === tileId) {
                delete this.tiles[index];
                return index;
            }
        }
        return TileOrganizer.MAX_TILES;
    }
}

export const tileOrganizer = new TileOrganizer();
