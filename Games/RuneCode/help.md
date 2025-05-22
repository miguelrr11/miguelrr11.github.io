| Left      | Right   | Hand Side | Result                                                                 |
|-----------|---------|----------|------------------------------------------------------------------------|
| ABSORB    | MANA    | Any      | If food is found: gains 30% of missing energy |
| ATTACK    | SHARD   | INWARD   | If shard is found: kills shard.                          |
| ATTACK    | MANA    | INWARD   | If mana is found: kills mana.                            |
| ATTACK    | SHIELD  | OUTWARD  | Reduces shield by 10.                                             |
| ATTACK    | SPELL   | INWARD   | Removes rune at the hands position.                   |
| REPAIR    | SHIELD  | OUTWARD  | Increases shield by 30% of missing shield.                        |
| REPAIR    | SPELL   | INWARD   | Repairs the rune at the hands position.                  |
| GO TO     | WEAK    | INWARD   | Moves hand to weakest rune.      |
| GO TO     | RPOS    | Any      | If from == to: moves hand to (hand + startPos) % runes.length.|
| GO TO     | INWARD  | Any      | Sets the hands side to INWARD.        |
| GO TO     | OUTWARD | Any      | Sets the hands side to OUTWARD.                |
| WRITE     | RPOS    | INWARD   | If from == to: inserts memory runes at the hands position.|
| WRITE     | Any     | OUTWARD  | Spawns new URB with memory runes.  |
| READ      | RPOS    | INWARD   | Copy runes [(hand + from):(hand + to)] to memory.            |
