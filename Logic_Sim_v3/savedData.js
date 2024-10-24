
let savedChips = [
    "{\"name\":\"chip0\",\"externalName\":\"NAND\",\"inputs\":[0,0],\"outputs\":[1],\"components\":[{\"name\":\"AND1\",\"type\":\"AND\",\"inputs\":[0,0],\"outputs\":[0],\"x\":371.70970253601,\"y\":376.73306401608363,\"width\":80,\"height\":62},{\"name\":\"NOT2\",\"type\":\"NOT\",\"inputs\":[0],\"outputs\":[1],\"x\":568.0425995169724,\"y\":376.098888714904,\"width\":80,\"height\":40}],\"chips\":[],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"AND1\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"AND1\",\"toIndex\":1},{\"fromComponent\":\"AND1\",\"fromIndex\":0,\"toComponent\":\"NOT2\",\"toIndex\":0},{\"fromComponent\":\"NOT2\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":378.01784552490267,\"y\":316.4115712873561,\"width\":80,\"height\":62,\"isSub\":false}",
    "{\"name\":\"chip3\",\"externalName\":\"OR\",\"inputs\":[1,1],\"outputs\":[1],\"components\":[{\"name\":\"NOT6\",\"type\":\"NOT\",\"inputs\":[1],\"outputs\":[0],\"x\":228.6703120445543,\"y\":308.9105484453908,\"width\":80,\"height\":40},{\"name\":\"NOT7\",\"type\":\"NOT\",\"inputs\":[1],\"outputs\":[0],\"x\":244.38828782438986,\"y\":452.93814818075487,\"width\":80,\"height\":40}],\"chips\":[{\"name\":\"chip04\",\"externalName\":\"NAND\",\"inputs\":[0,0],\"outputs\":[1],\"components\":[{\"name\":\"AND1\",\"type\":\"AND\",\"inputs\":[0,0],\"outputs\":[0],\"x\":403.640373224122,\"y\":250.9195198152381,\"width\":80,\"height\":62},{\"name\":\"NOT2\",\"type\":\"NOT\",\"inputs\":[0],\"outputs\":[1],\"x\":867.118837514384,\"y\":691.9865180077632,\"width\":80,\"height\":40}],\"chips\":[],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"AND1\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"AND1\",\"toIndex\":1},{\"fromComponent\":\"AND1\",\"fromIndex\":0,\"toComponent\":\"NOT2\",\"toIndex\":0},{\"fromComponent\":\"NOT2\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":598.5813823485367,\"y\":340.9341241970708,\"width\":80,\"height\":62,\"isSub\":true}],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"NOT6\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"NOT7\",\"toIndex\":0},{\"fromComponent\":\"NOT7\",\"fromIndex\":0,\"toComponent\":\"chip04\",\"toIndex\":1},{\"fromComponent\":\"NOT6\",\"fromIndex\":0,\"toComponent\":\"chip04\",\"toIndex\":0},{\"fromComponent\":\"chip04\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":174.473902510271,\"y\":126.01910542415573,\"width\":80,\"height\":62,\"isSub\":false}",
    "{\"name\":\"chip8\",\"externalName\":\"XOR\",\"inputs\":[1,1],\"outputs\":[0],\"components\":[{\"name\":\"OR11\",\"type\":\"OR\",\"inputs\":[1,1],\"outputs\":[1],\"x\":494.08294786756403,\"y\":258.34715357450784,\"width\":80,\"height\":62},{\"name\":\"AND14\",\"type\":\"AND\",\"inputs\":[1,0],\"outputs\":[0],\"x\":694.2796660324427,\"y\":353.43673270284785,\"width\":80,\"height\":62}],\"chips\":[{\"name\":\"chip012\",\"externalName\":\"NAND\",\"inputs\":[1,1],\"outputs\":[0],\"components\":[{\"name\":\"AND1\",\"type\":\"AND\",\"inputs\":[1,1],\"outputs\":[1],\"x\":576.5472091072118,\"y\":122.23038514635122,\"width\":80,\"height\":62},{\"name\":\"NOT2\",\"type\":\"NOT\",\"inputs\":[1],\"outputs\":[0],\"x\":455.0618722608429,\"y\":558.2826856846914,\"width\":80,\"height\":40}],\"chips\":[],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"AND1\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"AND1\",\"toIndex\":1},{\"fromComponent\":\"AND1\",\"fromIndex\":0,\"toComponent\":\"NOT2\",\"toIndex\":0},{\"fromComponent\":\"NOT2\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":481.6854479044797,\"y\":507.1470707488563,\"width\":80,\"height\":62,\"isSub\":true}],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"OR11\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"OR11\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"chip012\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"chip012\",\"toIndex\":0},{\"fromComponent\":\"OR11\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":0},{\"fromComponent\":\"chip012\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":1},{\"fromComponent\":\"AND14\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":479.97548248937494,\"y\":674.5141519857644,\"width\":80,\"height\":62,\"isSub\":false}",
    "{\"name\":\"chip15\",\"externalName\":\"ADDER\",\"inputs\":[1,1,1],\"outputs\":[1,1],\"components\":[{\"name\":\"AND18\",\"type\":\"AND\",\"inputs\":[1,1],\"outputs\":[1],\"x\":358.82522550354815,\"y\":565.0573078286546,\"width\":80,\"height\":62},{\"name\":\"AND21\",\"type\":\"AND\",\"inputs\":[0,1],\"outputs\":[0],\"x\":506.6875508687698,\"y\":380.34603289727477,\"width\":80,\"height\":62},{\"name\":\"OR22\",\"type\":\"OR\",\"inputs\":[0,1],\"outputs\":[1],\"x\":751.6696103116999,\"y\":534.9247314259497,\"width\":80,\"height\":62}],\"chips\":[{\"name\":\"chip816\",\"externalName\":\"XOR\",\"inputs\":[1,1],\"outputs\":[0],\"components\":[{\"name\":\"OR11\",\"type\":\"OR\",\"inputs\":[1,1],\"outputs\":[1],\"x\":860.2146471897643,\"y\":588.614539698907,\"width\":80,\"height\":62},{\"name\":\"AND14\",\"type\":\"AND\",\"inputs\":[1,0],\"outputs\":[0],\"x\":637.5109921047668,\"y\":582.5664893180709,\"width\":80,\"height\":62}],\"chips\":[{\"name\":\"chip012\",\"inputs\":[1,1],\"outputs\":[0],\"components\":[{\"name\":\"AND1\",\"type\":\"AND\",\"inputs\":[1,1],\"outputs\":[1],\"x\":864.7651262492628,\"y\":188.01193685918196,\"width\":80,\"height\":62},{\"name\":\"NOT2\",\"type\":\"NOT\",\"inputs\":[1],\"outputs\":[0],\"x\":904.6920046260739,\"y\":512.64923405676,\"width\":80,\"height\":40}],\"chips\":[],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"AND1\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"AND1\",\"toIndex\":1},{\"fromComponent\":\"AND1\",\"fromIndex\":0,\"toComponent\":\"NOT2\",\"toIndex\":0},{\"fromComponent\":\"NOT2\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":703.5953039409623,\"y\":653.228679215915,\"width\":80,\"height\":62,\"isSub\":false}],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"OR11\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"OR11\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"chip012\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"chip012\",\"toIndex\":0},{\"fromComponent\":\"OR11\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":0},{\"fromComponent\":\"chip012\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":1},{\"fromComponent\":\"AND14\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":298.9794937749198,\"y\":214.75509314327098,\"width\":80,\"height\":62,\"isSub\":true},{\"name\":\"chip819\",\"externalName\":\"XOR\",\"inputs\":[0,1],\"outputs\":[1],\"components\":[{\"name\":\"OR11\",\"type\":\"OR\",\"inputs\":[0,1],\"outputs\":[1],\"x\":779.6319785299733,\"y\":305.2594620814622,\"width\":80,\"height\":62},{\"name\":\"AND14\",\"type\":\"AND\",\"inputs\":[1,1],\"outputs\":[1],\"x\":190.588879922207,\"y\":515.4825446396071,\"width\":80,\"height\":62}],\"chips\":[{\"name\":\"chip012\",\"inputs\":[0,1],\"outputs\":[1],\"components\":[{\"name\":\"AND1\",\"type\":\"AND\",\"inputs\":[0,1],\"outputs\":[0],\"x\":845.272949022915,\"y\":142.34804416522647,\"width\":80,\"height\":62},{\"name\":\"NOT2\",\"type\":\"NOT\",\"inputs\":[0],\"outputs\":[1],\"x\":287.83198113327074,\"y\":637.5385588444983,\"width\":80,\"height\":40}],\"chips\":[],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"AND1\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"AND1\",\"toIndex\":1},{\"fromComponent\":\"AND1\",\"fromIndex\":0,\"toComponent\":\"NOT2\",\"toIndex\":0},{\"fromComponent\":\"NOT2\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":860.5261441036388,\"y\":287.7917687517672,\"width\":80,\"height\":62,\"isSub\":false}],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"OR11\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"OR11\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"chip012\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"chip012\",\"toIndex\":0},{\"fromComponent\":\"OR11\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":0},{\"fromComponent\":\"chip012\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":1},{\"fromComponent\":\"AND14\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":580.3184683414217,\"y\":260.5305177321918,\"width\":80,\"height\":62,\"isSub\":true}],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"chip816\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"chip816\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"AND18\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"AND18\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":2,\"toComponent\":\"chip819\",\"toIndex\":1},{\"fromComponent\":\"chip816\",\"fromIndex\":0,\"toComponent\":\"chip819\",\"toIndex\":0},{\"fromComponent\":\"chip819\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0},{\"fromComponent\":\"chip816\",\"fromIndex\":0,\"toComponent\":\"AND21\",\"toIndex\":0},{\"fromComponent\":\"AND21\",\"fromIndex\":0,\"toComponent\":\"OR22\",\"toIndex\":0},{\"fromComponent\":\"AND18\",\"fromIndex\":0,\"toComponent\":\"OR22\",\"toIndex\":1},{\"fromComponent\":\"OR22\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":2,\"toComponent\":\"AND21\",\"toIndex\":1}],\"x\":749.3940574985974,\"y\":452.98416262338895,\"width\":80,\"height\":62,\"isSub\":false}",
    "{\"name\":\"chip23\",\"externalName\":\"4-BIT ADDER\",\"inputs\":[0,0,0,0,0,0,0,0,0],\"outputs\":[0,0,0,0,0],\"components\":[],\"chips\":[{\"name\":\"chip1524\",\"externalName\":\"ADDER\",\"inputs\":[0,0,0],\"outputs\":[0,0],\"components\":[{\"name\":\"AND18\",\"type\":\"AND\",\"inputs\":[0,0],\"outputs\":[0],\"x\":755.3999757505527,\"y\":278.64209880782676,\"width\":80,\"height\":62},{\"name\":\"AND21\",\"type\":\"AND\",\"inputs\":[0,0],\"outputs\":[0],\"x\":350.5929616131067,\"y\":109.17301417874499,\"width\":80,\"height\":62},{\"name\":\"OR22\",\"type\":\"OR\",\"inputs\":[0,0],\"outputs\":[0],\"x\":572.2053391372594,\"y\":538.790887191401,\"width\":80,\"height\":62}],\"chips\":[{\"name\":\"chip816\",\"inputs\":[0,0],\"outputs\":[0],\"components\":[{\"name\":\"OR11\",\"type\":\"OR\",\"inputs\":[0,0],\"outputs\":[0],\"x\":263.62519968049975,\"y\":599.8027519716048,\"width\":80,\"height\":62},{\"name\":\"AND14\",\"type\":\"AND\",\"inputs\":[0,1],\"outputs\":[0],\"x\":648.7900930025903,\"y\":133.09869371988896,\"width\":80,\"height\":62}],\"chips\":[{\"name\":\"chip012\",\"inputs\":[0,0],\"outputs\":[1],\"components\":[{\"name\":\"AND1\",\"type\":\"AND\",\"inputs\":[0,0],\"outputs\":[0],\"x\":858.8445522322619,\"y\":213.230081379325,\"width\":80,\"height\":62},{\"name\":\"NOT2\",\"type\":\"NOT\",\"inputs\":[0],\"outputs\":[1],\"x\":133.78037654188574,\"y\":445.20699976452636,\"width\":80,\"height\":40}],\"chips\":[],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"AND1\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"AND1\",\"toIndex\":1},{\"fromComponent\":\"AND1\",\"fromIndex\":0,\"toComponent\":\"NOT2\",\"toIndex\":0},{\"fromComponent\":\"NOT2\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":694.4508204036046,\"y\":476.4368793695667,\"width\":80,\"height\":62,\"isSub\":false}],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"OR11\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"OR11\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"chip012\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"chip012\",\"toIndex\":0},{\"fromComponent\":\"OR11\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":0},{\"fromComponent\":\"chip012\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":1},{\"fromComponent\":\"AND14\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":336.95090329516006,\"y\":127.6519263953276,\"width\":80,\"height\":62,\"isSub\":false},{\"name\":\"chip819\",\"inputs\":[0,0],\"outputs\":[0],\"components\":[{\"name\":\"OR11\",\"type\":\"OR\",\"inputs\":[0,0],\"outputs\":[0],\"x\":666.6171472320491,\"y\":282.7756771877826,\"width\":80,\"height\":62},{\"name\":\"AND14\",\"type\":\"AND\",\"inputs\":[0,1],\"outputs\":[0],\"x\":881.1050986374217,\"y\":605.0780726590606,\"width\":80,\"height\":62}],\"chips\":[{\"name\":\"chip012\",\"inputs\":[0,0],\"outputs\":[1],\"components\":[{\"name\":\"AND1\",\"type\":\"AND\",\"inputs\":[0,0],\"outputs\":[0],\"x\":428.639068293729,\"y\":301.5375952015465,\"width\":80,\"height\":62},{\"name\":\"NOT2\",\"type\":\"NOT\",\"inputs\":[0],\"outputs\":[1],\"x\":125.81026024866024,\"y\":183.6166459214419,\"width\":80,\"height\":40}],\"chips\":[],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"AND1\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"AND1\",\"toIndex\":1},{\"fromComponent\":\"AND1\",\"fromIndex\":0,\"toComponent\":\"NOT2\",\"toIndex\":0},{\"fromComponent\":\"NOT2\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":756.883458904775,\"y\":565.8828985584781,\"width\":80,\"height\":62,\"isSub\":false}],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"OR11\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"OR11\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"chip012\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"chip012\",\"toIndex\":0},{\"fromComponent\":\"OR11\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":0},{\"fromComponent\":\"chip012\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":1},{\"fromComponent\":\"AND14\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":957.9976188879185,\"y\":556.6419110364195,\"width\":80,\"height\":62,\"isSub\":false}],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"chip816\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"chip816\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"AND18\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"AND18\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":2,\"toComponent\":\"chip819\",\"toIndex\":1},{\"fromComponent\":\"chip816\",\"fromIndex\":0,\"toComponent\":\"chip819\",\"toIndex\":0},{\"fromComponent\":\"chip819\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0},{\"fromComponent\":\"chip816\",\"fromIndex\":0,\"toComponent\":\"AND21\",\"toIndex\":0},{\"fromComponent\":\"AND21\",\"fromIndex\":0,\"toComponent\":\"OR22\",\"toIndex\":0},{\"fromComponent\":\"AND18\",\"fromIndex\":0,\"toComponent\":\"OR22\",\"toIndex\":1},{\"fromComponent\":\"OR22\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":2,\"toComponent\":\"AND21\",\"toIndex\":1}],\"x\":578.7437648745404,\"y\":328.2375737113201,\"width\":80,\"height\":84,\"isSub\":true},{\"name\":\"chip1526\",\"externalName\":\"ADDER\",\"inputs\":[0,0,0],\"outputs\":[0,0],\"components\":[{\"name\":\"AND18\",\"type\":\"AND\",\"inputs\":[0,0],\"outputs\":[0],\"x\":508.147450655099,\"y\":269.7292333059647,\"width\":80,\"height\":62},{\"name\":\"AND21\",\"type\":\"AND\",\"inputs\":[0,0],\"outputs\":[0],\"x\":858.4820305084545,\"y\":649.1844028763909,\"width\":80,\"height\":62},{\"name\":\"OR22\",\"type\":\"OR\",\"inputs\":[0,0],\"outputs\":[0],\"x\":792.411396000881,\"y\":300.9583578754467,\"width\":80,\"height\":62}],\"chips\":[{\"name\":\"chip816\",\"inputs\":[0,0],\"outputs\":[0],\"components\":[{\"name\":\"OR11\",\"type\":\"OR\",\"inputs\":[0,0],\"outputs\":[0],\"x\":884.7973508738838,\"y\":300.16846488846875,\"width\":80,\"height\":62},{\"name\":\"AND14\",\"type\":\"AND\",\"inputs\":[0,1],\"outputs\":[0],\"x\":495.1304769133628,\"y\":616.6188460130403,\"width\":80,\"height\":62}],\"chips\":[{\"name\":\"chip012\",\"inputs\":[0,0],\"outputs\":[1],\"components\":[{\"name\":\"AND1\",\"type\":\"AND\",\"inputs\":[0,0],\"outputs\":[0],\"x\":331.9800127513685,\"y\":697.478373329948,\"width\":80,\"height\":62},{\"name\":\"NOT2\",\"type\":\"NOT\",\"inputs\":[0],\"outputs\":[1],\"x\":242.5450960389042,\"y\":119.93545561089545,\"width\":80,\"height\":40}],\"chips\":[],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"AND1\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"AND1\",\"toIndex\":1},{\"fromComponent\":\"AND1\",\"fromIndex\":0,\"toComponent\":\"NOT2\",\"toIndex\":0},{\"fromComponent\":\"NOT2\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":589.9375722729192,\"y\":487.98095809032367,\"width\":80,\"height\":62,\"isSub\":false}],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"OR11\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"OR11\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"chip012\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"chip012\",\"toIndex\":0},{\"fromComponent\":\"OR11\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":0},{\"fromComponent\":\"chip012\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":1},{\"fromComponent\":\"AND14\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":857.2334464389492,\"y\":371.0121829479792,\"width\":80,\"height\":62,\"isSub\":false},{\"name\":\"chip819\",\"inputs\":[0,0],\"outputs\":[0],\"components\":[{\"name\":\"OR11\",\"type\":\"OR\",\"inputs\":[0,0],\"outputs\":[0],\"x\":711.4795527073356,\"y\":322.4289632391316,\"width\":80,\"height\":62},{\"name\":\"AND14\",\"type\":\"AND\",\"inputs\":[0,1],\"outputs\":[0],\"x\":473.5033558143021,\"y\":250.53819107159194,\"width\":80,\"height\":62}],\"chips\":[{\"name\":\"chip012\",\"inputs\":[0,0],\"outputs\":[1],\"components\":[{\"name\":\"AND1\",\"type\":\"AND\",\"inputs\":[0,0],\"outputs\":[0],\"x\":873.3610936681439,\"y\":649.2431634953554,\"width\":80,\"height\":62},{\"name\":\"NOT2\",\"type\":\"NOT\",\"inputs\":[0],\"outputs\":[1],\"x\":459.3497405029926,\"y\":568.1831809604485,\"width\":80,\"height\":40}],\"chips\":[],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"AND1\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"AND1\",\"toIndex\":1},{\"fromComponent\":\"AND1\",\"fromIndex\":0,\"toComponent\":\"NOT2\",\"toIndex\":0},{\"fromComponent\":\"NOT2\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":777.7967840992445,\"y\":578.9101576369969,\"width\":80,\"height\":62,\"isSub\":false}],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"OR11\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"OR11\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"chip012\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"chip012\",\"toIndex\":0},{\"fromComponent\":\"OR11\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":0},{\"fromComponent\":\"chip012\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":1},{\"fromComponent\":\"AND14\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":631.2848500773397,\"y\":549.9203295656264,\"width\":80,\"height\":62,\"isSub\":false}],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"chip816\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"chip816\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"AND18\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"AND18\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":2,\"toComponent\":\"chip819\",\"toIndex\":1},{\"fromComponent\":\"chip816\",\"fromIndex\":0,\"toComponent\":\"chip819\",\"toIndex\":0},{\"fromComponent\":\"chip819\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0},{\"fromComponent\":\"chip816\",\"fromIndex\":0,\"toComponent\":\"AND21\",\"toIndex\":0},{\"fromComponent\":\"AND21\",\"fromIndex\":0,\"toComponent\":\"OR22\",\"toIndex\":0},{\"fromComponent\":\"AND18\",\"fromIndex\":0,\"toComponent\":\"OR22\",\"toIndex\":1},{\"fromComponent\":\"OR22\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":2,\"toComponent\":\"AND21\",\"toIndex\":1}],\"x\":242.70652376590832,\"y\":592.7685500290685,\"width\":80,\"height\":84,\"isSub\":true},{\"name\":\"chip1528\",\"externalName\":\"ADDER\",\"inputs\":[0,0,0],\"outputs\":[0,0],\"components\":[{\"name\":\"AND18\",\"type\":\"AND\",\"inputs\":[0,0],\"outputs\":[0],\"x\":831.3138364575848,\"y\":244.97038696646774,\"width\":80,\"height\":62},{\"name\":\"AND21\",\"type\":\"AND\",\"inputs\":[0,0],\"outputs\":[0],\"x\":612.726513871378,\"y\":301.05867211853035,\"width\":80,\"height\":62},{\"name\":\"OR22\",\"type\":\"OR\",\"inputs\":[0,0],\"outputs\":[0],\"x\":525.3961759667928,\"y\":167.1495096096005,\"width\":80,\"height\":62}],\"chips\":[{\"name\":\"chip816\",\"inputs\":[0,0],\"outputs\":[0],\"components\":[{\"name\":\"OR11\",\"type\":\"OR\",\"inputs\":[0,0],\"outputs\":[0],\"x\":416.6617312313029,\"y\":280.7416470252416,\"width\":80,\"height\":62},{\"name\":\"AND14\",\"type\":\"AND\",\"inputs\":[0,1],\"outputs\":[0],\"x\":222.52665630063535,\"y\":400.7601692103461,\"width\":80,\"height\":62}],\"chips\":[{\"name\":\"chip012\",\"inputs\":[0,0],\"outputs\":[1],\"components\":[{\"name\":\"AND1\",\"type\":\"AND\",\"inputs\":[0,0],\"outputs\":[0],\"x\":376.1229050115659,\"y\":168.22661740293702,\"width\":80,\"height\":62},{\"name\":\"NOT2\",\"type\":\"NOT\",\"inputs\":[0],\"outputs\":[1],\"x\":947.9404296674719,\"y\":327.693620988373,\"width\":80,\"height\":40}],\"chips\":[],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"AND1\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"AND1\",\"toIndex\":1},{\"fromComponent\":\"AND1\",\"fromIndex\":0,\"toComponent\":\"NOT2\",\"toIndex\":0},{\"fromComponent\":\"NOT2\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":214.85160082632171,\"y\":355.3607318685118,\"width\":80,\"height\":62,\"isSub\":false}],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"OR11\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"OR11\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"chip012\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"chip012\",\"toIndex\":0},{\"fromComponent\":\"OR11\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":0},{\"fromComponent\":\"chip012\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":1},{\"fromComponent\":\"AND14\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":481.72126201845384,\"y\":379.94022572201715,\"width\":80,\"height\":62,\"isSub\":false},{\"name\":\"chip819\",\"inputs\":[0,0],\"outputs\":[0],\"components\":[{\"name\":\"OR11\",\"type\":\"OR\",\"inputs\":[0,0],\"outputs\":[0],\"x\":787.7167507715762,\"y\":103.91306367225167,\"width\":80,\"height\":62},{\"name\":\"AND14\",\"type\":\"AND\",\"inputs\":[0,1],\"outputs\":[0],\"x\":178.07007376418522,\"y\":666.5871786323887,\"width\":80,\"height\":62}],\"chips\":[{\"name\":\"chip012\",\"inputs\":[0,0],\"outputs\":[1],\"components\":[{\"name\":\"AND1\",\"type\":\"AND\",\"inputs\":[0,0],\"outputs\":[0],\"x\":623.7864217247875,\"y\":460.0880877626307,\"width\":80,\"height\":62},{\"name\":\"NOT2\",\"type\":\"NOT\",\"inputs\":[0],\"outputs\":[1],\"x\":608.7685531554785,\"y\":589.2491471960933,\"width\":80,\"height\":40}],\"chips\":[],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"AND1\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"AND1\",\"toIndex\":1},{\"fromComponent\":\"AND1\",\"fromIndex\":0,\"toComponent\":\"NOT2\",\"toIndex\":0},{\"fromComponent\":\"NOT2\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":601.2799070881208,\"y\":302.6011236042991,\"width\":80,\"height\":62,\"isSub\":false}],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"OR11\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"OR11\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"chip012\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"chip012\",\"toIndex\":0},{\"fromComponent\":\"OR11\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":0},{\"fromComponent\":\"chip012\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":1},{\"fromComponent\":\"AND14\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":256.47328650811596,\"y\":311.8133373511564,\"width\":80,\"height\":62,\"isSub\":false}],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"chip816\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"chip816\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"AND18\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"AND18\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":2,\"toComponent\":\"chip819\",\"toIndex\":1},{\"fromComponent\":\"chip816\",\"fromIndex\":0,\"toComponent\":\"chip819\",\"toIndex\":0},{\"fromComponent\":\"chip819\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0},{\"fromComponent\":\"chip816\",\"fromIndex\":0,\"toComponent\":\"AND21\",\"toIndex\":0},{\"fromComponent\":\"AND21\",\"fromIndex\":0,\"toComponent\":\"OR22\",\"toIndex\":0},{\"fromComponent\":\"AND18\",\"fromIndex\":0,\"toComponent\":\"OR22\",\"toIndex\":1},{\"fromComponent\":\"OR22\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":2,\"toComponent\":\"AND21\",\"toIndex\":1}],\"x\":731.3735974222345,\"y\":195.63527499520072,\"width\":80,\"height\":84,\"isSub\":true},{\"name\":\"chip1530\",\"externalName\":\"ADDER\",\"inputs\":[0,0,0],\"outputs\":[0,0],\"components\":[{\"name\":\"AND18\",\"type\":\"AND\",\"inputs\":[0,0],\"outputs\":[0],\"x\":450.75898344475513,\"y\":668.9501082254607,\"width\":80,\"height\":62},{\"name\":\"AND21\",\"type\":\"AND\",\"inputs\":[0,0],\"outputs\":[0],\"x\":558.6412272861811,\"y\":648.5481932922089,\"width\":80,\"height\":62},{\"name\":\"OR22\",\"type\":\"OR\",\"inputs\":[0,0],\"outputs\":[0],\"x\":508.756756697544,\"y\":109.28599473430593,\"width\":80,\"height\":62}],\"chips\":[{\"name\":\"chip816\",\"inputs\":[0,0],\"outputs\":[0],\"components\":[{\"name\":\"OR11\",\"type\":\"OR\",\"inputs\":[0,0],\"outputs\":[0],\"x\":139.22826223997853,\"y\":400.9761305801291,\"width\":80,\"height\":62},{\"name\":\"AND14\",\"type\":\"AND\",\"inputs\":[0,1],\"outputs\":[0],\"x\":948.1025255496046,\"y\":235.4435646750277,\"width\":80,\"height\":62}],\"chips\":[{\"name\":\"chip012\",\"inputs\":[0,0],\"outputs\":[1],\"components\":[{\"name\":\"AND1\",\"type\":\"AND\",\"inputs\":[0,0],\"outputs\":[0],\"x\":867.7150176982714,\"y\":550.1301351176451,\"width\":80,\"height\":62},{\"name\":\"NOT2\",\"type\":\"NOT\",\"inputs\":[0],\"outputs\":[1],\"x\":149.41284318228676,\"y\":419.1034274600445,\"width\":80,\"height\":40}],\"chips\":[],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"AND1\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"AND1\",\"toIndex\":1},{\"fromComponent\":\"AND1\",\"fromIndex\":0,\"toComponent\":\"NOT2\",\"toIndex\":0},{\"fromComponent\":\"NOT2\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":279.00762311186816,\"y\":367.00128171429765,\"width\":80,\"height\":62,\"isSub\":false}],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"OR11\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"OR11\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"chip012\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"chip012\",\"toIndex\":0},{\"fromComponent\":\"OR11\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":0},{\"fromComponent\":\"chip012\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":1},{\"fromComponent\":\"AND14\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":257.08393100616263,\"y\":550.4111959004799,\"width\":80,\"height\":62,\"isSub\":false},{\"name\":\"chip819\",\"inputs\":[0,0],\"outputs\":[0],\"components\":[{\"name\":\"OR11\",\"type\":\"OR\",\"inputs\":[0,0],\"outputs\":[0],\"x\":380.8735126745667,\"y\":359.87886751563934,\"width\":80,\"height\":62},{\"name\":\"AND14\",\"type\":\"AND\",\"inputs\":[0,1],\"outputs\":[0],\"x\":229.30844071540156,\"y\":415.63282959749307,\"width\":80,\"height\":62}],\"chips\":[{\"name\":\"chip012\",\"inputs\":[0,0],\"outputs\":[1],\"components\":[{\"name\":\"AND1\",\"type\":\"AND\",\"inputs\":[0,0],\"outputs\":[0],\"x\":274.5667385792133,\"y\":168.49410567843694,\"width\":80,\"height\":62},{\"name\":\"NOT2\",\"type\":\"NOT\",\"inputs\":[0],\"outputs\":[1],\"x\":734.7199362100722,\"y\":194.13305565760515,\"width\":80,\"height\":40}],\"chips\":[],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"AND1\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"AND1\",\"toIndex\":1},{\"fromComponent\":\"AND1\",\"fromIndex\":0,\"toComponent\":\"NOT2\",\"toIndex\":0},{\"fromComponent\":\"NOT2\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":953.6525349436183,\"y\":207.00757628955927,\"width\":80,\"height\":62,\"isSub\":false}],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"OR11\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"OR11\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"chip012\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"chip012\",\"toIndex\":0},{\"fromComponent\":\"OR11\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":0},{\"fromComponent\":\"chip012\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":1},{\"fromComponent\":\"AND14\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":457.55958559431974,\"y\":569.7713242820035,\"width\":80,\"height\":62,\"isSub\":false}],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"chip816\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"chip816\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"AND18\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"AND18\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":2,\"toComponent\":\"chip819\",\"toIndex\":1},{\"fromComponent\":\"chip816\",\"fromIndex\":0,\"toComponent\":\"chip819\",\"toIndex\":0},{\"fromComponent\":\"chip819\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0},{\"fromComponent\":\"chip816\",\"fromIndex\":0,\"toComponent\":\"AND21\",\"toIndex\":0},{\"fromComponent\":\"AND21\",\"fromIndex\":0,\"toComponent\":\"OR22\",\"toIndex\":0},{\"fromComponent\":\"AND18\",\"fromIndex\":0,\"toComponent\":\"OR22\",\"toIndex\":1},{\"fromComponent\":\"OR22\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":2,\"toComponent\":\"AND21\",\"toIndex\":1}],\"x\":428.0214450511302,\"y\":459.327458088655,\"width\":80,\"height\":84,\"isSub\":true}],\"connections\":[{\"fromComponent\":\"chip1528\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0},{\"fromComponent\":\"chip1524\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":1},{\"fromComponent\":\"chip1530\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":2},{\"fromComponent\":\"chip1526\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":3},{\"fromComponent\":\"INPUTS\",\"fromIndex\":8,\"toComponent\":\"chip1526\",\"toIndex\":2},{\"fromComponent\":\"chip1526\",\"fromIndex\":1,\"toComponent\":\"chip1530\",\"toIndex\":2},{\"fromComponent\":\"chip1530\",\"fromIndex\":1,\"toComponent\":\"chip1524\",\"toIndex\":2},{\"fromComponent\":\"chip1524\",\"fromIndex\":1,\"toComponent\":\"chip1528\",\"toIndex\":2},{\"fromComponent\":\"chip1528\",\"fromIndex\":1,\"toComponent\":\"OUTPUTS\",\"toIndex\":4},{\"fromComponent\":\"INPUTS\",\"fromIndex\":7,\"toComponent\":\"chip1526\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":6,\"toComponent\":\"chip1530\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":5,\"toComponent\":\"chip1524\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":4,\"toComponent\":\"chip1528\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":3,\"toComponent\":\"chip1526\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":2,\"toComponent\":\"chip1530\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"chip1524\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"chip1528\",\"toIndex\":0}],\"x\":486.82737229474446,\"y\":433.0337767349561,\"width\":80,\"height\":62,\"isSub\":false}",
    "{\"name\":\"chip32\",\"externalName\":\"4-BIT ADDER & SUB\",\"inputs\":[1,1,1,0,1,1,0,0,0],\"outputs\":[1,0,1,0,1,1,0],\"components\":[{\"name\":\"DISPLAY50\",\"type\":\"DISPLAY\",\"inputs\":[1,0,1,0],\"outputs\":[],\"x\":635.9867652170417,\"y\":63.2601191922148,\"width\":100,\"height\":106},{\"name\":\"NOT51\",\"type\":\"NOT\",\"inputs\":[1],\"outputs\":[0],\"x\":593.4388696025098,\"y\":527.7292574220714,\"width\":80,\"height\":40},{\"name\":\"NOT52\",\"type\":\"NOT\",\"inputs\":[1],\"outputs\":[0],\"x\":592.6642002509889,\"y\":619.2981986679576,\"width\":80,\"height\":40},{\"name\":\"NOT53\",\"type\":\"NOT\",\"inputs\":[0],\"outputs\":[1],\"x\":592.6896427370922,\"y\":573.5853551768536,\"width\":80,\"height\":40},{\"name\":\"NOT54\",\"type\":\"NOT\",\"inputs\":[0],\"outputs\":[1],\"x\":590.4627353126969,\"y\":665.1038151388514,\"width\":80,\"height\":40},{\"name\":\"AND55\",\"type\":\"AND\",\"inputs\":[0,1],\"outputs\":[0],\"x\":709.9680844341842,\"y\":569.2167861401405,\"width\":80,\"height\":62},{\"name\":\"AND56\",\"type\":\"AND\",\"inputs\":[0,0],\"outputs\":[0],\"x\":815.3830951918012,\"y\":599.8846515581921,\"width\":80,\"height\":62},{\"name\":\"AND57\",\"type\":\"AND\",\"inputs\":[0,1],\"outputs\":[0],\"x\":919.8271944813716,\"y\":638.823609162778,\"width\":80,\"height\":62},{\"name\":\"DISPLAY58\",\"type\":\"DISPLAY\",\"inputs\":[1,1,1,0],\"outputs\":[],\"x\":193.358761855569,\"y\":91.8688927125072,\"width\":100,\"height\":106},{\"name\":\"DISPLAY59\",\"type\":\"DISPLAY\",\"inputs\":[1,1,0,0],\"outputs\":[],\"x\":188.61191612124946,\"y\":266.9098881841463,\"width\":100,\"height\":106}],\"chips\":[{\"name\":\"chip2340\",\"externalName\":\"4BIT ADDER\",\"inputs\":[1,1,1,0,1,1,0,0,0],\"outputs\":[1,0,1,0,1],\"components\":[],\"chips\":[{\"name\":\"chip1524\",\"inputs\":[1,1,0],\"outputs\":[0,1],\"components\":[{\"name\":\"AND18\",\"type\":\"AND\",\"inputs\":[1,1],\"outputs\":[1],\"x\":794.678428876508,\"y\":291.3929279458637,\"width\":80,\"height\":62},{\"name\":\"AND21\",\"type\":\"AND\",\"inputs\":[0,0],\"outputs\":[0],\"x\":636.3524371150619,\"y\":114.1875130594161,\"width\":80,\"height\":62},{\"name\":\"OR22\",\"type\":\"OR\",\"inputs\":[0,1],\"outputs\":[1],\"x\":674.576940264048,\"y\":650.8691768398671,\"width\":80,\"height\":62}],\"chips\":[{\"name\":\"chip816\",\"inputs\":[1,1],\"outputs\":[0],\"components\":[{\"name\":\"OR11\",\"type\":\"OR\",\"inputs\":[1,1],\"outputs\":[1],\"x\":937.2296207984297,\"y\":324.6033075895865,\"width\":80,\"height\":62},{\"name\":\"AND14\",\"type\":\"AND\",\"inputs\":[1,0],\"outputs\":[0],\"x\":888.4215339686649,\"y\":200.62093142650417,\"width\":80,\"height\":62}],\"chips\":[{\"name\":\"chip012\",\"inputs\":[1,1],\"outputs\":[0],\"components\":[{\"name\":\"AND1\",\"type\":\"AND\",\"inputs\":[1,1],\"outputs\":[1],\"x\":805.0229448346304,\"y\":494.2649119273803,\"width\":80,\"height\":62},{\"name\":\"NOT2\",\"type\":\"NOT\",\"inputs\":[1],\"outputs\":[0],\"x\":430.0961632307272,\"y\":128.74669850515886,\"width\":80,\"height\":40}],\"chips\":[],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"AND1\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"AND1\",\"toIndex\":1},{\"fromComponent\":\"AND1\",\"fromIndex\":0,\"toComponent\":\"NOT2\",\"toIndex\":0},{\"fromComponent\":\"NOT2\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":512.8242342648384,\"y\":468.2708568780357,\"width\":80,\"height\":62,\"isSub\":false}],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"OR11\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"OR11\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"chip012\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"chip012\",\"toIndex\":0},{\"fromComponent\":\"OR11\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":0},{\"fromComponent\":\"chip012\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":1},{\"fromComponent\":\"AND14\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":930.5512401787827,\"y\":588.1572371647529,\"width\":80,\"height\":62,\"isSub\":false},{\"name\":\"chip819\",\"inputs\":[0,0],\"outputs\":[0],\"components\":[{\"name\":\"OR11\",\"type\":\"OR\",\"inputs\":[0,0],\"outputs\":[0],\"x\":523.3789566441118,\"y\":376.9052274369504,\"width\":80,\"height\":62},{\"name\":\"AND14\",\"type\":\"AND\",\"inputs\":[0,1],\"outputs\":[0],\"x\":420.3271389008826,\"y\":342.2364681169735,\"width\":80,\"height\":62}],\"chips\":[{\"name\":\"chip012\",\"inputs\":[0,0],\"outputs\":[1],\"components\":[{\"name\":\"AND1\",\"type\":\"AND\",\"inputs\":[0,0],\"outputs\":[0],\"x\":164.10424841438237,\"y\":265.0798452376373,\"width\":80,\"height\":62},{\"name\":\"NOT2\",\"type\":\"NOT\",\"inputs\":[0],\"outputs\":[1],\"x\":286.0892343590109,\"y\":384.8463804564001,\"width\":80,\"height\":40}],\"chips\":[],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"AND1\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"AND1\",\"toIndex\":1},{\"fromComponent\":\"AND1\",\"fromIndex\":0,\"toComponent\":\"NOT2\",\"toIndex\":0},{\"fromComponent\":\"NOT2\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":229.05642839758235,\"y\":588.0429204076925,\"width\":80,\"height\":62,\"isSub\":false}],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"OR11\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"OR11\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"chip012\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"chip012\",\"toIndex\":0},{\"fromComponent\":\"OR11\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":0},{\"fromComponent\":\"chip012\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":1},{\"fromComponent\":\"AND14\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":322.2415552972617,\"y\":482.17384083616133,\"width\":80,\"height\":62,\"isSub\":false}],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"chip816\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"chip816\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"AND18\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"AND18\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":2,\"toComponent\":\"chip819\",\"toIndex\":1},{\"fromComponent\":\"chip816\",\"fromIndex\":0,\"toComponent\":\"chip819\",\"toIndex\":0},{\"fromComponent\":\"chip819\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0},{\"fromComponent\":\"chip816\",\"fromIndex\":0,\"toComponent\":\"AND21\",\"toIndex\":0},{\"fromComponent\":\"AND21\",\"fromIndex\":0,\"toComponent\":\"OR22\",\"toIndex\":0},{\"fromComponent\":\"AND18\",\"fromIndex\":0,\"toComponent\":\"OR22\",\"toIndex\":1},{\"fromComponent\":\"OR22\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":2,\"toComponent\":\"AND21\",\"toIndex\":1}],\"x\":107.70306013888077,\"y\":418.54640758534146,\"width\":80,\"height\":84,\"isSub\":false},{\"name\":\"chip1526\",\"inputs\":[0,0,0],\"outputs\":[0,0],\"components\":[{\"name\":\"AND18\",\"type\":\"AND\",\"inputs\":[0,0],\"outputs\":[0],\"x\":912.0606587902905,\"y\":295.70777328220845,\"width\":80,\"height\":62},{\"name\":\"AND21\",\"type\":\"AND\",\"inputs\":[0,0],\"outputs\":[0],\"x\":106.50679291296035,\"y\":493.33843892646445,\"width\":80,\"height\":62},{\"name\":\"OR22\",\"type\":\"OR\",\"inputs\":[0,0],\"outputs\":[0],\"x\":816.3235528466522,\"y\":385.8312906416918,\"width\":80,\"height\":62}],\"chips\":[{\"name\":\"chip816\",\"inputs\":[0,0],\"outputs\":[0],\"components\":[{\"name\":\"OR11\",\"type\":\"OR\",\"inputs\":[0,0],\"outputs\":[0],\"x\":707.552485849321,\"y\":679.5820224284968,\"width\":80,\"height\":62},{\"name\":\"AND14\",\"type\":\"AND\",\"inputs\":[0,1],\"outputs\":[0],\"x\":243.37238137906235,\"y\":604.3005729094921,\"width\":80,\"height\":62}],\"chips\":[{\"name\":\"chip012\",\"inputs\":[0,0],\"outputs\":[1],\"components\":[{\"name\":\"AND1\",\"type\":\"AND\",\"inputs\":[0,0],\"outputs\":[0],\"x\":914.3893363895335,\"y\":610.4631176143398,\"width\":80,\"height\":62},{\"name\":\"NOT2\",\"type\":\"NOT\",\"inputs\":[0],\"outputs\":[1],\"x\":276.46114152038774,\"y\":605.975358595439,\"width\":80,\"height\":40}],\"chips\":[],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"AND1\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"AND1\",\"toIndex\":1},{\"fromComponent\":\"AND1\",\"fromIndex\":0,\"toComponent\":\"NOT2\",\"toIndex\":0},{\"fromComponent\":\"NOT2\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":751.3486323812114,\"y\":458.92691368919316,\"width\":80,\"height\":62,\"isSub\":false}],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"OR11\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"OR11\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"chip012\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"chip012\",\"toIndex\":0},{\"fromComponent\":\"OR11\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":0},{\"fromComponent\":\"chip012\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":1},{\"fromComponent\":\"AND14\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":628.9069566142498,\"y\":475.3198130949404,\"width\":80,\"height\":62,\"isSub\":false},{\"name\":\"chip819\",\"inputs\":[0,0],\"outputs\":[0],\"components\":[{\"name\":\"OR11\",\"type\":\"OR\",\"inputs\":[0,0],\"outputs\":[0],\"x\":963.9394581189164,\"y\":441.11135199712857,\"width\":80,\"height\":62},{\"name\":\"AND14\",\"type\":\"AND\",\"inputs\":[0,1],\"outputs\":[0],\"x\":797.6639831656819,\"y\":459.74544096435886,\"width\":80,\"height\":62}],\"chips\":[{\"name\":\"chip012\",\"inputs\":[0,0],\"outputs\":[1],\"components\":[{\"name\":\"AND1\",\"type\":\"AND\",\"inputs\":[0,0],\"outputs\":[0],\"x\":478.56634623114877,\"y\":120.52805876914601,\"width\":80,\"height\":62},{\"name\":\"NOT2\",\"type\":\"NOT\",\"inputs\":[0],\"outputs\":[1],\"x\":800.4860970628133,\"y\":537.0779365778658,\"width\":80,\"height\":40}],\"chips\":[],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"AND1\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"AND1\",\"toIndex\":1},{\"fromComponent\":\"AND1\",\"fromIndex\":0,\"toComponent\":\"NOT2\",\"toIndex\":0},{\"fromComponent\":\"NOT2\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":149.62905466762962,\"y\":370.30200181650025,\"width\":80,\"height\":62,\"isSub\":false}],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"OR11\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"OR11\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"chip012\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"chip012\",\"toIndex\":0},{\"fromComponent\":\"OR11\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":0},{\"fromComponent\":\"chip012\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":1},{\"fromComponent\":\"AND14\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":712.7169925932786,\"y\":232.28020123719898,\"width\":80,\"height\":62,\"isSub\":false}],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"chip816\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"chip816\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"AND18\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"AND18\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":2,\"toComponent\":\"chip819\",\"toIndex\":1},{\"fromComponent\":\"chip816\",\"fromIndex\":0,\"toComponent\":\"chip819\",\"toIndex\":0},{\"fromComponent\":\"chip819\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0},{\"fromComponent\":\"chip816\",\"fromIndex\":0,\"toComponent\":\"AND21\",\"toIndex\":0},{\"fromComponent\":\"AND21\",\"fromIndex\":0,\"toComponent\":\"OR22\",\"toIndex\":0},{\"fromComponent\":\"AND18\",\"fromIndex\":0,\"toComponent\":\"OR22\",\"toIndex\":1},{\"fromComponent\":\"OR22\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":2,\"toComponent\":\"AND21\",\"toIndex\":1}],\"x\":331.17670351146796,\"y\":272.6064046628644,\"width\":80,\"height\":84,\"isSub\":false},{\"name\":\"chip1528\",\"inputs\":[1,1,1],\"outputs\":[1,1],\"components\":[{\"name\":\"AND18\",\"type\":\"AND\",\"inputs\":[1,1],\"outputs\":[1],\"x\":846.9939038881765,\"y\":498.9508614703145,\"width\":80,\"height\":62},{\"name\":\"AND21\",\"type\":\"AND\",\"inputs\":[0,1],\"outputs\":[0],\"x\":706.7073990292705,\"y\":394.76901165287984,\"width\":80,\"height\":62},{\"name\":\"OR22\",\"type\":\"OR\",\"inputs\":[0,1],\"outputs\":[1],\"x\":443.4945967045227,\"y\":156.31322985440073,\"width\":80,\"height\":62}],\"chips\":[{\"name\":\"chip816\",\"inputs\":[1,1],\"outputs\":[0],\"components\":[{\"name\":\"OR11\",\"type\":\"OR\",\"inputs\":[1,1],\"outputs\":[1],\"x\":563.7770536631818,\"y\":118.66766370373622,\"width\":80,\"height\":62},{\"name\":\"AND14\",\"type\":\"AND\",\"inputs\":[1,0],\"outputs\":[0],\"x\":735.615643455052,\"y\":495.1009112389683,\"width\":80,\"height\":62}],\"chips\":[{\"name\":\"chip012\",\"inputs\":[1,1],\"outputs\":[0],\"components\":[{\"name\":\"AND1\",\"type\":\"AND\",\"inputs\":[1,1],\"outputs\":[1],\"x\":367.53800871383555,\"y\":257.20174747482736,\"width\":80,\"height\":62},{\"name\":\"NOT2\",\"type\":\"NOT\",\"inputs\":[1],\"outputs\":[0],\"x\":673.8319761010476,\"y\":253.0826542942406,\"width\":80,\"height\":40}],\"chips\":[],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"AND1\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"AND1\",\"toIndex\":1},{\"fromComponent\":\"AND1\",\"fromIndex\":0,\"toComponent\":\"NOT2\",\"toIndex\":0},{\"fromComponent\":\"NOT2\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":112.18925828147353,\"y\":524.6582117385674,\"width\":80,\"height\":62,\"isSub\":false}],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"OR11\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"OR11\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"chip012\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"chip012\",\"toIndex\":0},{\"fromComponent\":\"OR11\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":0},{\"fromComponent\":\"chip012\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":1},{\"fromComponent\":\"AND14\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":545.6533224777626,\"y\":375.9443099077885,\"width\":80,\"height\":62,\"isSub\":false},{\"name\":\"chip819\",\"inputs\":[0,1],\"outputs\":[1],\"components\":[{\"name\":\"OR11\",\"type\":\"OR\",\"inputs\":[0,1],\"outputs\":[1],\"x\":387.82151685350425,\"y\":306.7117516832957,\"width\":80,\"height\":62},{\"name\":\"AND14\",\"type\":\"AND\",\"inputs\":[1,1],\"outputs\":[1],\"x\":653.408875723549,\"y\":414.0733907041833,\"width\":80,\"height\":62}],\"chips\":[{\"name\":\"chip012\",\"inputs\":[0,1],\"outputs\":[1],\"components\":[{\"name\":\"AND1\",\"type\":\"AND\",\"inputs\":[0,1],\"outputs\":[0],\"x\":550.0707763319219,\"y\":306.79216469109895,\"width\":80,\"height\":62},{\"name\":\"NOT2\",\"type\":\"NOT\",\"inputs\":[0],\"outputs\":[1],\"x\":320.0839294019114,\"y\":347.1642061608344,\"width\":80,\"height\":40}],\"chips\":[],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"AND1\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"AND1\",\"toIndex\":1},{\"fromComponent\":\"AND1\",\"fromIndex\":0,\"toComponent\":\"NOT2\",\"toIndex\":0},{\"fromComponent\":\"NOT2\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":964.3944190975808,\"y\":613.8444180292616,\"width\":80,\"height\":62,\"isSub\":false}],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"OR11\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"OR11\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"chip012\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"chip012\",\"toIndex\":0},{\"fromComponent\":\"OR11\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":0},{\"fromComponent\":\"chip012\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":1},{\"fromComponent\":\"AND14\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":439.03384889587187,\"y\":569.4342788661675,\"width\":80,\"height\":62,\"isSub\":false}],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"chip816\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"chip816\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"AND18\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"AND18\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":2,\"toComponent\":\"chip819\",\"toIndex\":1},{\"fromComponent\":\"chip816\",\"fromIndex\":0,\"toComponent\":\"chip819\",\"toIndex\":0},{\"fromComponent\":\"chip819\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0},{\"fromComponent\":\"chip816\",\"fromIndex\":0,\"toComponent\":\"AND21\",\"toIndex\":0},{\"fromComponent\":\"AND21\",\"fromIndex\":0,\"toComponent\":\"OR22\",\"toIndex\":0},{\"fromComponent\":\"AND18\",\"fromIndex\":0,\"toComponent\":\"OR22\",\"toIndex\":1},{\"fromComponent\":\"OR22\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":2,\"toComponent\":\"AND21\",\"toIndex\":1}],\"x\":253.1319624387603,\"y\":207.88164733742084,\"width\":80,\"height\":84,\"isSub\":false},{\"name\":\"chip1530\",\"inputs\":[1,0,0],\"outputs\":[1,0],\"components\":[{\"name\":\"AND18\",\"type\":\"AND\",\"inputs\":[1,0],\"outputs\":[0],\"x\":769.369629554813,\"y\":316.7980195345108,\"width\":80,\"height\":62},{\"name\":\"AND21\",\"type\":\"AND\",\"inputs\":[1,0],\"outputs\":[0],\"x\":468.558428986951,\"y\":389.126060634486,\"width\":80,\"height\":62},{\"name\":\"OR22\",\"type\":\"OR\",\"inputs\":[0,0],\"outputs\":[0],\"x\":644.2476251862539,\"y\":225.58065616256377,\"width\":80,\"height\":62}],\"chips\":[{\"name\":\"chip816\",\"inputs\":[1,0],\"outputs\":[1],\"components\":[{\"name\":\"OR11\",\"type\":\"OR\",\"inputs\":[1,0],\"outputs\":[1],\"x\":836.3956603371371,\"y\":680.2614695720342,\"width\":80,\"height\":62},{\"name\":\"AND14\",\"type\":\"AND\",\"inputs\":[1,1],\"outputs\":[1],\"x\":884.8417137173064,\"y\":105.46814212491742,\"width\":80,\"height\":62}],\"chips\":[{\"name\":\"chip012\",\"inputs\":[1,0],\"outputs\":[1],\"components\":[{\"name\":\"AND1\",\"type\":\"AND\",\"inputs\":[1,0],\"outputs\":[0],\"x\":746.1870009585667,\"y\":433.55258674179527,\"width\":80,\"height\":62},{\"name\":\"NOT2\",\"type\":\"NOT\",\"inputs\":[0],\"outputs\":[1],\"x\":561.4376612847034,\"y\":197.56532740505753,\"width\":80,\"height\":40}],\"chips\":[],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"AND1\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"AND1\",\"toIndex\":1},{\"fromComponent\":\"AND1\",\"fromIndex\":0,\"toComponent\":\"NOT2\",\"toIndex\":0},{\"fromComponent\":\"NOT2\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":794.876359364757,\"y\":138.0594618088054,\"width\":80,\"height\":62,\"isSub\":false}],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"OR11\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"OR11\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"chip012\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"chip012\",\"toIndex\":0},{\"fromComponent\":\"OR11\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":0},{\"fromComponent\":\"chip012\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":1},{\"fromComponent\":\"AND14\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":689.0429295389632,\"y\":365.2314105617649,\"width\":80,\"height\":62,\"isSub\":false},{\"name\":\"chip819\",\"inputs\":[1,0],\"outputs\":[1],\"components\":[{\"name\":\"OR11\",\"type\":\"OR\",\"inputs\":[1,0],\"outputs\":[1],\"x\":513.5229709851108,\"y\":609.782743985957,\"width\":80,\"height\":62},{\"name\":\"AND14\",\"type\":\"AND\",\"inputs\":[1,1],\"outputs\":[1],\"x\":332.02212289498686,\"y\":255.59128656362122,\"width\":80,\"height\":62}],\"chips\":[{\"name\":\"chip012\",\"inputs\":[1,0],\"outputs\":[1],\"components\":[{\"name\":\"AND1\",\"type\":\"AND\",\"inputs\":[1,0],\"outputs\":[0],\"x\":353.53080286893896,\"y\":513.1590262407383,\"width\":80,\"height\":62},{\"name\":\"NOT2\",\"type\":\"NOT\",\"inputs\":[0],\"outputs\":[1],\"x\":169.79182099477535,\"y\":206.15207371496078,\"width\":80,\"height\":40}],\"chips\":[],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"AND1\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"AND1\",\"toIndex\":1},{\"fromComponent\":\"AND1\",\"fromIndex\":0,\"toComponent\":\"NOT2\",\"toIndex\":0},{\"fromComponent\":\"NOT2\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":275.14472923620895,\"y\":181.01189019307907,\"width\":80,\"height\":62,\"isSub\":false}],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"OR11\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"OR11\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"chip012\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"chip012\",\"toIndex\":0},{\"fromComponent\":\"OR11\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":0},{\"fromComponent\":\"chip012\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":1},{\"fromComponent\":\"AND14\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":986.8019587282092,\"y\":688.5974060940567,\"width\":80,\"height\":62,\"isSub\":false}],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"chip816\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"chip816\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"AND18\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"AND18\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":2,\"toComponent\":\"chip819\",\"toIndex\":1},{\"fromComponent\":\"chip816\",\"fromIndex\":0,\"toComponent\":\"chip819\",\"toIndex\":0},{\"fromComponent\":\"chip819\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0},{\"fromComponent\":\"chip816\",\"fromIndex\":0,\"toComponent\":\"AND21\",\"toIndex\":0},{\"fromComponent\":\"AND21\",\"fromIndex\":0,\"toComponent\":\"OR22\",\"toIndex\":0},{\"fromComponent\":\"AND18\",\"fromIndex\":0,\"toComponent\":\"OR22\",\"toIndex\":1},{\"fromComponent\":\"OR22\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":2,\"toComponent\":\"AND21\",\"toIndex\":1}],\"x\":522.3558864665345,\"y\":631.0502733371936,\"width\":80,\"height\":84,\"isSub\":false}],\"connections\":[{\"fromComponent\":\"chip1528\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0},{\"fromComponent\":\"chip1524\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":1},{\"fromComponent\":\"chip1530\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":2},{\"fromComponent\":\"chip1526\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":3},{\"fromComponent\":\"INPUTS\",\"fromIndex\":8,\"toComponent\":\"chip1526\",\"toIndex\":2},{\"fromComponent\":\"chip1526\",\"fromIndex\":1,\"toComponent\":\"chip1530\",\"toIndex\":2},{\"fromComponent\":\"chip1530\",\"fromIndex\":1,\"toComponent\":\"chip1524\",\"toIndex\":2},{\"fromComponent\":\"chip1524\",\"fromIndex\":1,\"toComponent\":\"chip1528\",\"toIndex\":2},{\"fromComponent\":\"chip1528\",\"fromIndex\":1,\"toComponent\":\"OUTPUTS\",\"toIndex\":4},{\"fromComponent\":\"INPUTS\",\"fromIndex\":7,\"toComponent\":\"chip1526\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":6,\"toComponent\":\"chip1530\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":5,\"toComponent\":\"chip1524\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":4,\"toComponent\":\"chip1528\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":3,\"toComponent\":\"chip1526\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":2,\"toComponent\":\"chip1530\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"chip1524\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"chip1528\",\"toIndex\":0}],\"x\":378.6890464697491,\"y\":227.11851805541954,\"width\":80,\"height\":216,\"isSub\":true},{\"name\":\"chip842\",\"externalName\":\"XOR\",\"inputs\":[0,0],\"outputs\":[0],\"components\":[{\"name\":\"OR11\",\"type\":\"OR\",\"inputs\":[0,0],\"outputs\":[0],\"x\":626.933110677444,\"y\":181.74353727928366,\"width\":80,\"height\":62},{\"name\":\"AND14\",\"type\":\"AND\",\"inputs\":[0,1],\"outputs\":[0],\"x\":822.1650875023965,\"y\":233.78857410262262,\"width\":80,\"height\":62}],\"chips\":[{\"name\":\"chip012\",\"inputs\":[0,0],\"outputs\":[1],\"components\":[{\"name\":\"AND1\",\"type\":\"AND\",\"inputs\":[0,0],\"outputs\":[0],\"x\":214.02475292988203,\"y\":342.56701145895016,\"width\":80,\"height\":62},{\"name\":\"NOT2\",\"type\":\"NOT\",\"inputs\":[0],\"outputs\":[1],\"x\":553.101166598399,\"y\":156.02243343232934,\"width\":80,\"height\":40}],\"chips\":[],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"AND1\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"AND1\",\"toIndex\":1},{\"fromComponent\":\"AND1\",\"fromIndex\":0,\"toComponent\":\"NOT2\",\"toIndex\":0},{\"fromComponent\":\"NOT2\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":333.30548290387014,\"y\":606.3221434054733,\"width\":80,\"height\":62,\"isSub\":false}],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"OR11\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"OR11\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"chip012\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"chip012\",\"toIndex\":0},{\"fromComponent\":\"OR11\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":0},{\"fromComponent\":\"chip012\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":1},{\"fromComponent\":\"AND14\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":191.06399584594192,\"y\":549.903927746453,\"width\":80,\"height\":62,\"isSub\":true},{\"name\":\"chip844\",\"externalName\":\"XOR\",\"inputs\":[0,0],\"outputs\":[0],\"components\":[{\"name\":\"OR11\",\"type\":\"OR\",\"inputs\":[0,0],\"outputs\":[0],\"x\":269.4751238796533,\"y\":578.8036719871388,\"width\":80,\"height\":62},{\"name\":\"AND14\",\"type\":\"AND\",\"inputs\":[0,1],\"outputs\":[0],\"x\":697.4414945589657,\"y\":269.35840937392345,\"width\":80,\"height\":62}],\"chips\":[{\"name\":\"chip012\",\"inputs\":[0,0],\"outputs\":[1],\"components\":[{\"name\":\"AND1\",\"type\":\"AND\",\"inputs\":[0,0],\"outputs\":[0],\"x\":496.4738691643843,\"y\":375.27146752391184,\"width\":80,\"height\":62},{\"name\":\"NOT2\",\"type\":\"NOT\",\"inputs\":[0],\"outputs\":[1],\"x\":768.8559962244019,\"y\":558.7587380476525,\"width\":80,\"height\":40}],\"chips\":[],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"AND1\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"AND1\",\"toIndex\":1},{\"fromComponent\":\"AND1\",\"fromIndex\":0,\"toComponent\":\"NOT2\",\"toIndex\":0},{\"fromComponent\":\"NOT2\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":294.35059497157147,\"y\":126.83821594518703,\"width\":80,\"height\":62,\"isSub\":false}],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"OR11\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"OR11\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"chip012\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"chip012\",\"toIndex\":0},{\"fromComponent\":\"OR11\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":0},{\"fromComponent\":\"chip012\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":1},{\"fromComponent\":\"AND14\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":192.568278466813,\"y\":615.5588087354665,\"width\":80,\"height\":62,\"isSub\":true},{\"name\":\"chip846\",\"externalName\":\"XOR\",\"inputs\":[1,0],\"outputs\":[1],\"components\":[{\"name\":\"OR11\",\"type\":\"OR\",\"inputs\":[1,0],\"outputs\":[1],\"x\":641.9740301313001,\"y\":451.04628978401735,\"width\":80,\"height\":62},{\"name\":\"AND14\",\"type\":\"AND\",\"inputs\":[1,1],\"outputs\":[1],\"x\":769.3828849955172,\"y\":600.6011957909045,\"width\":80,\"height\":62}],\"chips\":[{\"name\":\"chip012\",\"inputs\":[1,0],\"outputs\":[1],\"components\":[{\"name\":\"AND1\",\"type\":\"AND\",\"inputs\":[1,0],\"outputs\":[0],\"x\":993.3536105528858,\"y\":642.5026128940708,\"width\":80,\"height\":62},{\"name\":\"NOT2\",\"type\":\"NOT\",\"inputs\":[0],\"outputs\":[1],\"x\":385.88574575500235,\"y\":168.39308748929903,\"width\":80,\"height\":40}],\"chips\":[],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"AND1\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"AND1\",\"toIndex\":1},{\"fromComponent\":\"AND1\",\"fromIndex\":0,\"toComponent\":\"NOT2\",\"toIndex\":0},{\"fromComponent\":\"NOT2\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":598.7560044803923,\"y\":312.82956670715487,\"width\":80,\"height\":62,\"isSub\":false}],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"OR11\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"OR11\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"chip012\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"chip012\",\"toIndex\":0},{\"fromComponent\":\"OR11\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":0},{\"fromComponent\":\"chip012\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":1},{\"fromComponent\":\"AND14\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":191.3002440598151,\"y\":482.5090925772214,\"width\":80,\"height\":62,\"isSub\":true},{\"name\":\"chip848\",\"externalName\":\"XOR\",\"inputs\":[1,0],\"outputs\":[1],\"components\":[{\"name\":\"OR11\",\"type\":\"OR\",\"inputs\":[1,0],\"outputs\":[1],\"x\":623.163654083566,\"y\":125.58163065129358,\"width\":80,\"height\":62},{\"name\":\"AND14\",\"type\":\"AND\",\"inputs\":[1,1],\"outputs\":[1],\"x\":941.773152166082,\"y\":557.0502150604101,\"width\":80,\"height\":62}],\"chips\":[{\"name\":\"chip012\",\"inputs\":[1,0],\"outputs\":[1],\"components\":[{\"name\":\"AND1\",\"type\":\"AND\",\"inputs\":[1,0],\"outputs\":[0],\"x\":900.4837981067423,\"y\":166.8732069191708,\"width\":80,\"height\":62},{\"name\":\"NOT2\",\"type\":\"NOT\",\"inputs\":[0],\"outputs\":[1],\"x\":932.0709191370887,\"y\":682.2757505815381,\"width\":80,\"height\":40}],\"chips\":[],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"AND1\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"AND1\",\"toIndex\":1},{\"fromComponent\":\"AND1\",\"fromIndex\":0,\"toComponent\":\"NOT2\",\"toIndex\":0},{\"fromComponent\":\"NOT2\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":926.5333057692504,\"y\":582.0586131077343,\"width\":80,\"height\":62,\"isSub\":false}],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"OR11\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"OR11\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"chip012\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"chip012\",\"toIndex\":0},{\"fromComponent\":\"OR11\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":0},{\"fromComponent\":\"chip012\",\"fromIndex\":0,\"toComponent\":\"AND14\",\"toIndex\":1},{\"fromComponent\":\"AND14\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0}],\"x\":193.72943202195927,\"y\":416.4727225330027,\"width\":80,\"height\":62,\"isSub\":true}],\"connections\":[{\"fromComponent\":\"INPUTS\",\"fromIndex\":4,\"toComponent\":\"chip848\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":5,\"toComponent\":\"chip846\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":6,\"toComponent\":\"chip842\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":7,\"toComponent\":\"chip844\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":8,\"toComponent\":\"chip844\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":8,\"toComponent\":\"chip842\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":8,\"toComponent\":\"chip846\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":8,\"toComponent\":\"chip848\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":8,\"toComponent\":\"chip2340\",\"toIndex\":8},{\"fromComponent\":\"chip844\",\"fromIndex\":0,\"toComponent\":\"chip2340\",\"toIndex\":7},{\"fromComponent\":\"chip842\",\"fromIndex\":0,\"toComponent\":\"chip2340\",\"toIndex\":6},{\"fromComponent\":\"chip846\",\"fromIndex\":0,\"toComponent\":\"chip2340\",\"toIndex\":5},{\"fromComponent\":\"chip848\",\"fromIndex\":0,\"toComponent\":\"chip2340\",\"toIndex\":4},{\"fromComponent\":\"chip2340\",\"fromIndex\":0,\"toComponent\":\"DISPLAY50\",\"toIndex\":0},{\"fromComponent\":\"chip2340\",\"fromIndex\":1,\"toComponent\":\"DISPLAY50\",\"toIndex\":1},{\"fromComponent\":\"chip2340\",\"fromIndex\":2,\"toComponent\":\"DISPLAY50\",\"toIndex\":2},{\"fromComponent\":\"chip2340\",\"fromIndex\":3,\"toComponent\":\"DISPLAY50\",\"toIndex\":3},{\"fromComponent\":\"INPUTS\",\"fromIndex\":3,\"toComponent\":\"chip2340\",\"toIndex\":3},{\"fromComponent\":\"INPUTS\",\"fromIndex\":2,\"toComponent\":\"chip2340\",\"toIndex\":2},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"chip2340\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"chip2340\",\"toIndex\":0},{\"fromComponent\":\"chip2340\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":0},{\"fromComponent\":\"chip2340\",\"fromIndex\":1,\"toComponent\":\"OUTPUTS\",\"toIndex\":1},{\"fromComponent\":\"chip2340\",\"fromIndex\":2,\"toComponent\":\"OUTPUTS\",\"toIndex\":2},{\"fromComponent\":\"chip2340\",\"fromIndex\":3,\"toComponent\":\"OUTPUTS\",\"toIndex\":3},{\"fromComponent\":\"chip2340\",\"fromIndex\":0,\"toComponent\":\"NOT51\",\"toIndex\":0},{\"fromComponent\":\"chip2340\",\"fromIndex\":1,\"toComponent\":\"NOT53\",\"toIndex\":0},{\"fromComponent\":\"chip2340\",\"fromIndex\":2,\"toComponent\":\"NOT52\",\"toIndex\":0},{\"fromComponent\":\"chip2340\",\"fromIndex\":3,\"toComponent\":\"NOT54\",\"toIndex\":0},{\"fromComponent\":\"NOT51\",\"fromIndex\":0,\"toComponent\":\"AND55\",\"toIndex\":0},{\"fromComponent\":\"NOT53\",\"fromIndex\":0,\"toComponent\":\"AND55\",\"toIndex\":1},{\"fromComponent\":\"AND55\",\"fromIndex\":0,\"toComponent\":\"AND56\",\"toIndex\":0},{\"fromComponent\":\"NOT52\",\"fromIndex\":0,\"toComponent\":\"AND56\",\"toIndex\":1},{\"fromComponent\":\"AND56\",\"fromIndex\":0,\"toComponent\":\"AND57\",\"toIndex\":0},{\"fromComponent\":\"NOT54\",\"fromIndex\":0,\"toComponent\":\"AND57\",\"toIndex\":1},{\"fromComponent\":\"AND57\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":6},{\"fromComponent\":\"chip2340\",\"fromIndex\":0,\"toComponent\":\"OUTPUTS\",\"toIndex\":5},{\"fromComponent\":\"chip2340\",\"fromIndex\":4,\"toComponent\":\"OUTPUTS\",\"toIndex\":4},{\"fromComponent\":\"INPUTS\",\"fromIndex\":0,\"toComponent\":\"DISPLAY58\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":1,\"toComponent\":\"DISPLAY58\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":2,\"toComponent\":\"DISPLAY58\",\"toIndex\":2},{\"fromComponent\":\"INPUTS\",\"fromIndex\":3,\"toComponent\":\"DISPLAY58\",\"toIndex\":3},{\"fromComponent\":\"INPUTS\",\"fromIndex\":4,\"toComponent\":\"DISPLAY59\",\"toIndex\":0},{\"fromComponent\":\"INPUTS\",\"fromIndex\":5,\"toComponent\":\"DISPLAY59\",\"toIndex\":1},{\"fromComponent\":\"INPUTS\",\"fromIndex\":6,\"toComponent\":\"DISPLAY59\",\"toIndex\":2},{\"fromComponent\":\"INPUTS\",\"fromIndex\":7,\"toComponent\":\"DISPLAY59\",\"toIndex\":3}],\"x\":989.2612264894182,\"y\":344.38062215852017,\"width\":80,\"height\":62,\"isSub\":false}"
]

let chipRegistry = [
    {
        "name": "chip0",
        "inputs": [
            0,
            0
        ],
        "outputs": [
            1
        ],
        "components": [
            {
                "name": "AND1",
                "type": "AND",
                "inputs": [
                    0,
                    0
                ],
                "outputs": [
                    0
                ],
                "x": 371.70970253601,
                "y": 376.73306401608363,
                "width": 80,
                "height": 62
            },
            {
                "name": "NOT2",
                "type": "NOT",
                "inputs": [
                    0
                ],
                "outputs": [
                    1
                ],
                "x": 568.0425995169724,
                "y": 376.098888714904,
                "width": 80,
                "height": 40
            }
        ],
        "chips": [],
        "connections": [
            {
                "fromComponent": "INPUTS",
                "fromIndex": 0,
                "toComponent": "AND1",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 1,
                "toComponent": "AND1",
                "toIndex": 1
            },
            {
                "fromComponent": "AND1",
                "fromIndex": 0,
                "toComponent": "NOT2",
                "toIndex": 0
            },
            {
                "fromComponent": "NOT2",
                "fromIndex": 0,
                "toComponent": "OUTPUTS",
                "toIndex": 0
            }
        ],
        "x": 378.01784552490267,
        "y": 316.4115712873561,
        "width": 80,
        "height": 62,
        "isSub": false
    },
    {
        "name": "chip0",
        "inputs": [
            0,
            0
        ],
        "outputs": [
            1
        ],
        "components": [
            {
                "name": "AND1",
                "type": "AND",
                "inputs": [
                    0,
                    0
                ],
                "outputs": [
                    0
                ],
                "x": 371.70970253601,
                "y": 376.73306401608363,
                "width": 80,
                "height": 62
            },
            {
                "name": "NOT2",
                "type": "NOT",
                "inputs": [
                    0
                ],
                "outputs": [
                    1
                ],
                "x": 568.0425995169724,
                "y": 376.098888714904,
                "width": 80,
                "height": 40
            }
        ],
        "chips": [],
        "connections": [
            {
                "fromComponent": "INPUTS",
                "fromIndex": 0,
                "toComponent": "AND1",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 1,
                "toComponent": "AND1",
                "toIndex": 1
            },
            {
                "fromComponent": "AND1",
                "fromIndex": 0,
                "toComponent": "NOT2",
                "toIndex": 0
            },
            {
                "fromComponent": "NOT2",
                "fromIndex": 0,
                "toComponent": "OUTPUTS",
                "toIndex": 0
            }
        ],
        "x": 378.01784552490267,
        "y": 316.4115712873561,
        "width": 80,
        "height": 62,
        "isSub": false
    },
    {
        "name": "chip04",
        "externalName": "NAND",
        "inputs": [
            0,
            0
        ],
        "outputs": [
            1
        ],
        "components": [
            {
                "name": "AND1",
                "type": "AND",
                "inputs": [
                    0,
                    0
                ],
                "outputs": [
                    0
                ],
                "x": 403.640373224122,
                "y": 250.9195198152381,
                "width": 80,
                "height": 62
            },
            {
                "name": "NOT2",
                "type": "NOT",
                "inputs": [
                    0
                ],
                "outputs": [
                    1
                ],
                "x": 867.118837514384,
                "y": 691.9865180077632,
                "width": 80,
                "height": 40
            }
        ],
        "chips": [],
        "connections": [
            {
                "fromComponent": "INPUTS",
                "fromIndex": 0,
                "toComponent": "AND1",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 1,
                "toComponent": "AND1",
                "toIndex": 1
            },
            {
                "fromComponent": "AND1",
                "fromIndex": 0,
                "toComponent": "NOT2",
                "toIndex": 0
            },
            {
                "fromComponent": "NOT2",
                "fromIndex": 0,
                "toComponent": "OUTPUTS",
                "toIndex": 0
            }
        ],
        "x": 598.5813823485367,
        "y": 340.9341241970708,
        "width": 80,
        "height": 62,
        "isSub": true
    },
    {
        "name": "chip3",
        "inputs": [
            1,
            1
        ],
        "outputs": [
            1
        ],
        "components": [
            {
                "name": "NOT6",
                "type": "NOT",
                "inputs": [
                    1
                ],
                "outputs": [
                    0
                ],
                "x": 228.6703120445543,
                "y": 308.9105484453908,
                "width": 80,
                "height": 40
            },
            {
                "name": "NOT7",
                "type": "NOT",
                "inputs": [
                    1
                ],
                "outputs": [
                    0
                ],
                "x": 244.38828782438986,
                "y": 452.93814818075487,
                "width": 80,
                "height": 40
            }
        ],
        "chips": [
            {
                "name": "chip04",
                "externalName": "NAND",
                "inputs": [
                    0,
                    0
                ],
                "outputs": [
                    1
                ],
                "components": [
                    {
                        "name": "AND1",
                        "type": "AND",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 403.640373224122,
                        "y": 250.9195198152381,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "NOT2",
                        "type": "NOT",
                        "inputs": [
                            0
                        ],
                        "outputs": [
                            1
                        ],
                        "x": 867.118837514384,
                        "y": 691.9865180077632,
                        "width": 80,
                        "height": 40
                    }
                ],
                "chips": [],
                "connections": [
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "AND1",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "AND1",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "AND1",
                        "fromIndex": 0,
                        "toComponent": "NOT2",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "NOT2",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 0
                    }
                ],
                "x": 598.5813823485367,
                "y": 340.9341241970708,
                "width": 80,
                "height": 62,
                "isSub": true
            }
        ],
        "connections": [
            {
                "fromComponent": "INPUTS",
                "fromIndex": 0,
                "toComponent": "NOT6",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 1,
                "toComponent": "NOT7",
                "toIndex": 0
            },
            {
                "fromComponent": "NOT7",
                "fromIndex": 0,
                "toComponent": "chip04",
                "toIndex": 1
            },
            {
                "fromComponent": "NOT6",
                "fromIndex": 0,
                "toComponent": "chip04",
                "toIndex": 0
            },
            {
                "fromComponent": "chip04",
                "fromIndex": 0,
                "toComponent": "OUTPUTS",
                "toIndex": 0
            }
        ],
        "x": 174.473902510271,
        "y": 126.01910542415573,
        "width": 80,
        "height": 62,
        "isSub": false
    },
    {
        "name": "chip39",
        "externalName": "OR",
        "inputs": [
            0,
            0
        ],
        "outputs": [
            0
        ],
        "components": [
            {
                "name": "NOT6",
                "type": "NOT",
                "inputs": [
                    0
                ],
                "outputs": [
                    1
                ],
                "x": 427.8886026500906,
                "y": 332.9346120447204,
                "width": 80,
                "height": 40
            },
            {
                "name": "NOT7",
                "type": "NOT",
                "inputs": [
                    0
                ],
                "outputs": [
                    1
                ],
                "x": 998.0788683475566,
                "y": 479.7924453714931,
                "width": 80,
                "height": 40
            }
        ],
        "chips": [
            {
                "name": "chip04",
                "inputs": [
                    1,
                    1
                ],
                "outputs": [
                    0
                ],
                "components": [
                    {
                        "name": "AND1",
                        "type": "AND",
                        "inputs": [
                            1,
                            1
                        ],
                        "outputs": [
                            1
                        ],
                        "x": 237.45675757228992,
                        "y": 422.68927499163584,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "NOT2",
                        "type": "NOT",
                        "inputs": [
                            1
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 257.50033363435136,
                        "y": 444.56388085528624,
                        "width": 80,
                        "height": 40
                    }
                ],
                "chips": [],
                "connections": [
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "AND1",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "AND1",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "AND1",
                        "fromIndex": 0,
                        "toComponent": "NOT2",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "NOT2",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 0
                    }
                ],
                "x": 384.1758666088431,
                "y": 476.96504500706163,
                "width": 80,
                "height": 62,
                "isSub": false
            }
        ],
        "connections": [
            {
                "fromComponent": "INPUTS",
                "fromIndex": 0,
                "toComponent": "NOT6",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 1,
                "toComponent": "NOT7",
                "toIndex": 0
            },
            {
                "fromComponent": "NOT7",
                "fromIndex": 0,
                "toComponent": "chip04",
                "toIndex": 1
            },
            {
                "fromComponent": "NOT6",
                "fromIndex": 0,
                "toComponent": "chip04",
                "toIndex": 0
            },
            {
                "fromComponent": "chip04",
                "fromIndex": 0,
                "toComponent": "OUTPUTS",
                "toIndex": 0
            }
        ],
        "x": 779.5912278961099,
        "y": 598.2306870567731,
        "width": 80,
        "height": 62,
        "isSub": true
    },
    {
        "name": "chip012",
        "externalName": "NAND",
        "inputs": [
            1,
            1
        ],
        "outputs": [
            0
        ],
        "components": [
            {
                "name": "AND1",
                "type": "AND",
                "inputs": [
                    1,
                    1
                ],
                "outputs": [
                    1
                ],
                "x": 576.5472091072118,
                "y": 122.23038514635122,
                "width": 80,
                "height": 62
            },
            {
                "name": "NOT2",
                "type": "NOT",
                "inputs": [
                    1
                ],
                "outputs": [
                    0
                ],
                "x": 455.0618722608429,
                "y": 558.2826856846914,
                "width": 80,
                "height": 40
            }
        ],
        "chips": [],
        "connections": [
            {
                "fromComponent": "INPUTS",
                "fromIndex": 0,
                "toComponent": "AND1",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 1,
                "toComponent": "AND1",
                "toIndex": 1
            },
            {
                "fromComponent": "AND1",
                "fromIndex": 0,
                "toComponent": "NOT2",
                "toIndex": 0
            },
            {
                "fromComponent": "NOT2",
                "fromIndex": 0,
                "toComponent": "OUTPUTS",
                "toIndex": 0
            }
        ],
        "x": 481.6854479044797,
        "y": 507.1470707488563,
        "width": 80,
        "height": 62,
        "isSub": true
    },
    {
        "name": "chip8",
        "inputs": [
            1,
            1
        ],
        "outputs": [
            0
        ],
        "components": [
            {
                "name": "OR11",
                "type": "OR",
                "inputs": [
                    1,
                    1
                ],
                "outputs": [
                    1
                ],
                "x": 494.08294786756403,
                "y": 258.34715357450784,
                "width": 80,
                "height": 62
            },
            {
                "name": "AND14",
                "type": "AND",
                "inputs": [
                    1,
                    0
                ],
                "outputs": [
                    0
                ],
                "x": 694.2796660324427,
                "y": 353.43673270284785,
                "width": 80,
                "height": 62
            }
        ],
        "chips": [
            {
                "name": "chip012",
                "externalName": "NAND",
                "inputs": [
                    1,
                    1
                ],
                "outputs": [
                    0
                ],
                "components": [
                    {
                        "name": "AND1",
                        "type": "AND",
                        "inputs": [
                            1,
                            1
                        ],
                        "outputs": [
                            1
                        ],
                        "x": 576.5472091072118,
                        "y": 122.23038514635122,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "NOT2",
                        "type": "NOT",
                        "inputs": [
                            1
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 455.0618722608429,
                        "y": 558.2826856846914,
                        "width": 80,
                        "height": 40
                    }
                ],
                "chips": [],
                "connections": [
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "AND1",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "AND1",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "AND1",
                        "fromIndex": 0,
                        "toComponent": "NOT2",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "NOT2",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 0
                    }
                ],
                "x": 481.6854479044797,
                "y": 507.1470707488563,
                "width": 80,
                "height": 62,
                "isSub": true
            }
        ],
        "connections": [
            {
                "fromComponent": "INPUTS",
                "fromIndex": 0,
                "toComponent": "OR11",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 1,
                "toComponent": "OR11",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 1,
                "toComponent": "chip012",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 0,
                "toComponent": "chip012",
                "toIndex": 0
            },
            {
                "fromComponent": "OR11",
                "fromIndex": 0,
                "toComponent": "AND14",
                "toIndex": 0
            },
            {
                "fromComponent": "chip012",
                "fromIndex": 0,
                "toComponent": "AND14",
                "toIndex": 1
            },
            {
                "fromComponent": "AND14",
                "fromIndex": 0,
                "toComponent": "OUTPUTS",
                "toIndex": 0
            }
        ],
        "x": 479.97548248937494,
        "y": 674.5141519857644,
        "width": 80,
        "height": 62,
        "isSub": false
    },
    {
        "name": "chip816",
        "externalName": "XOR",
        "inputs": [
            1,
            1
        ],
        "outputs": [
            0
        ],
        "components": [
            {
                "name": "OR11",
                "type": "OR",
                "inputs": [
                    1,
                    1
                ],
                "outputs": [
                    1
                ],
                "x": 860.2146471897643,
                "y": 588.614539698907,
                "width": 80,
                "height": 62
            },
            {
                "name": "AND14",
                "type": "AND",
                "inputs": [
                    1,
                    0
                ],
                "outputs": [
                    0
                ],
                "x": 637.5109921047668,
                "y": 582.5664893180709,
                "width": 80,
                "height": 62
            }
        ],
        "chips": [
            {
                "name": "chip012",
                "inputs": [
                    1,
                    1
                ],
                "outputs": [
                    0
                ],
                "components": [
                    {
                        "name": "AND1",
                        "type": "AND",
                        "inputs": [
                            1,
                            1
                        ],
                        "outputs": [
                            1
                        ],
                        "x": 864.7651262492628,
                        "y": 188.01193685918196,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "NOT2",
                        "type": "NOT",
                        "inputs": [
                            1
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 904.6920046260739,
                        "y": 512.64923405676,
                        "width": 80,
                        "height": 40
                    }
                ],
                "chips": [],
                "connections": [
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "AND1",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "AND1",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "AND1",
                        "fromIndex": 0,
                        "toComponent": "NOT2",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "NOT2",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 0
                    }
                ],
                "x": 703.5953039409623,
                "y": 653.228679215915,
                "width": 80,
                "height": 62,
                "isSub": false
            }
        ],
        "connections": [
            {
                "fromComponent": "INPUTS",
                "fromIndex": 0,
                "toComponent": "OR11",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 1,
                "toComponent": "OR11",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 1,
                "toComponent": "chip012",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 0,
                "toComponent": "chip012",
                "toIndex": 0
            },
            {
                "fromComponent": "OR11",
                "fromIndex": 0,
                "toComponent": "AND14",
                "toIndex": 0
            },
            {
                "fromComponent": "chip012",
                "fromIndex": 0,
                "toComponent": "AND14",
                "toIndex": 1
            },
            {
                "fromComponent": "AND14",
                "fromIndex": 0,
                "toComponent": "OUTPUTS",
                "toIndex": 0
            }
        ],
        "x": 298.9794937749198,
        "y": 214.75509314327098,
        "width": 80,
        "height": 62,
        "isSub": true
    },
    {
        "name": "chip819",
        "externalName": "XOR",
        "inputs": [
            0,
            1
        ],
        "outputs": [
            1
        ],
        "components": [
            {
                "name": "OR11",
                "type": "OR",
                "inputs": [
                    0,
                    1
                ],
                "outputs": [
                    1
                ],
                "x": 779.6319785299733,
                "y": 305.2594620814622,
                "width": 80,
                "height": 62
            },
            {
                "name": "AND14",
                "type": "AND",
                "inputs": [
                    1,
                    1
                ],
                "outputs": [
                    1
                ],
                "x": 190.588879922207,
                "y": 515.4825446396071,
                "width": 80,
                "height": 62
            }
        ],
        "chips": [
            {
                "name": "chip012",
                "inputs": [
                    0,
                    1
                ],
                "outputs": [
                    1
                ],
                "components": [
                    {
                        "name": "AND1",
                        "type": "AND",
                        "inputs": [
                            0,
                            1
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 845.272949022915,
                        "y": 142.34804416522647,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "NOT2",
                        "type": "NOT",
                        "inputs": [
                            0
                        ],
                        "outputs": [
                            1
                        ],
                        "x": 287.83198113327074,
                        "y": 637.5385588444983,
                        "width": 80,
                        "height": 40
                    }
                ],
                "chips": [],
                "connections": [
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "AND1",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "AND1",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "AND1",
                        "fromIndex": 0,
                        "toComponent": "NOT2",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "NOT2",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 0
                    }
                ],
                "x": 860.5261441036388,
                "y": 287.7917687517672,
                "width": 80,
                "height": 62,
                "isSub": false
            }
        ],
        "connections": [
            {
                "fromComponent": "INPUTS",
                "fromIndex": 0,
                "toComponent": "OR11",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 1,
                "toComponent": "OR11",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 1,
                "toComponent": "chip012",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 0,
                "toComponent": "chip012",
                "toIndex": 0
            },
            {
                "fromComponent": "OR11",
                "fromIndex": 0,
                "toComponent": "AND14",
                "toIndex": 0
            },
            {
                "fromComponent": "chip012",
                "fromIndex": 0,
                "toComponent": "AND14",
                "toIndex": 1
            },
            {
                "fromComponent": "AND14",
                "fromIndex": 0,
                "toComponent": "OUTPUTS",
                "toIndex": 0
            }
        ],
        "x": 580.3184683414217,
        "y": 260.5305177321918,
        "width": 80,
        "height": 62,
        "isSub": true
    },
    {
        "name": "chip15",
        "inputs": [
            1,
            1,
            1
        ],
        "outputs": [
            1,
            1
        ],
        "components": [
            {
                "name": "AND18",
                "type": "AND",
                "inputs": [
                    1,
                    1
                ],
                "outputs": [
                    1
                ],
                "x": 358.82522550354815,
                "y": 565.0573078286546,
                "width": 80,
                "height": 62
            },
            {
                "name": "AND21",
                "type": "AND",
                "inputs": [
                    0,
                    1
                ],
                "outputs": [
                    0
                ],
                "x": 506.6875508687698,
                "y": 380.34603289727477,
                "width": 80,
                "height": 62
            },
            {
                "name": "OR22",
                "type": "OR",
                "inputs": [
                    0,
                    1
                ],
                "outputs": [
                    1
                ],
                "x": 751.6696103116999,
                "y": 534.9247314259497,
                "width": 80,
                "height": 62
            }
        ],
        "chips": [
            {
                "name": "chip816",
                "externalName": "XOR",
                "inputs": [
                    1,
                    1
                ],
                "outputs": [
                    0
                ],
                "components": [
                    {
                        "name": "OR11",
                        "type": "OR",
                        "inputs": [
                            1,
                            1
                        ],
                        "outputs": [
                            1
                        ],
                        "x": 860.2146471897643,
                        "y": 588.614539698907,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "AND14",
                        "type": "AND",
                        "inputs": [
                            1,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 637.5109921047668,
                        "y": 582.5664893180709,
                        "width": 80,
                        "height": 62
                    }
                ],
                "chips": [
                    {
                        "name": "chip012",
                        "inputs": [
                            1,
                            1
                        ],
                        "outputs": [
                            0
                        ],
                        "components": [
                            {
                                "name": "AND1",
                                "type": "AND",
                                "inputs": [
                                    1,
                                    1
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 864.7651262492628,
                                "y": 188.01193685918196,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "NOT2",
                                "type": "NOT",
                                "inputs": [
                                    1
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 904.6920046260739,
                                "y": 512.64923405676,
                                "width": 80,
                                "height": 40
                            }
                        ],
                        "chips": [],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "AND1",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "AND1",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND1",
                                "fromIndex": 0,
                                "toComponent": "NOT2",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "NOT2",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 703.5953039409623,
                        "y": 653.228679215915,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    }
                ],
                "connections": [
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "OR11",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "OR11",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "chip012",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "chip012",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "OR11",
                        "fromIndex": 0,
                        "toComponent": "AND14",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip012",
                        "fromIndex": 0,
                        "toComponent": "AND14",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "AND14",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 0
                    }
                ],
                "x": 298.9794937749198,
                "y": 214.75509314327098,
                "width": 80,
                "height": 62,
                "isSub": true
            },
            {
                "name": "chip819",
                "externalName": "XOR",
                "inputs": [
                    0,
                    1
                ],
                "outputs": [
                    1
                ],
                "components": [
                    {
                        "name": "OR11",
                        "type": "OR",
                        "inputs": [
                            0,
                            1
                        ],
                        "outputs": [
                            1
                        ],
                        "x": 779.6319785299733,
                        "y": 305.2594620814622,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "AND14",
                        "type": "AND",
                        "inputs": [
                            1,
                            1
                        ],
                        "outputs": [
                            1
                        ],
                        "x": 190.588879922207,
                        "y": 515.4825446396071,
                        "width": 80,
                        "height": 62
                    }
                ],
                "chips": [
                    {
                        "name": "chip012",
                        "inputs": [
                            0,
                            1
                        ],
                        "outputs": [
                            1
                        ],
                        "components": [
                            {
                                "name": "AND1",
                                "type": "AND",
                                "inputs": [
                                    0,
                                    1
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 845.272949022915,
                                "y": 142.34804416522647,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "NOT2",
                                "type": "NOT",
                                "inputs": [
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 287.83198113327074,
                                "y": 637.5385588444983,
                                "width": 80,
                                "height": 40
                            }
                        ],
                        "chips": [],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "AND1",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "AND1",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND1",
                                "fromIndex": 0,
                                "toComponent": "NOT2",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "NOT2",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 860.5261441036388,
                        "y": 287.7917687517672,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    }
                ],
                "connections": [
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "OR11",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "OR11",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "chip012",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "chip012",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "OR11",
                        "fromIndex": 0,
                        "toComponent": "AND14",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip012",
                        "fromIndex": 0,
                        "toComponent": "AND14",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "AND14",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 0
                    }
                ],
                "x": 580.3184683414217,
                "y": 260.5305177321918,
                "width": 80,
                "height": 62,
                "isSub": true
            }
        ],
        "connections": [
            {
                "fromComponent": "INPUTS",
                "fromIndex": 0,
                "toComponent": "chip816",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 1,
                "toComponent": "chip816",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 0,
                "toComponent": "AND18",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 1,
                "toComponent": "AND18",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 2,
                "toComponent": "chip819",
                "toIndex": 1
            },
            {
                "fromComponent": "chip816",
                "fromIndex": 0,
                "toComponent": "chip819",
                "toIndex": 0
            },
            {
                "fromComponent": "chip819",
                "fromIndex": 0,
                "toComponent": "OUTPUTS",
                "toIndex": 0
            },
            {
                "fromComponent": "chip816",
                "fromIndex": 0,
                "toComponent": "AND21",
                "toIndex": 0
            },
            {
                "fromComponent": "AND21",
                "fromIndex": 0,
                "toComponent": "OR22",
                "toIndex": 0
            },
            {
                "fromComponent": "AND18",
                "fromIndex": 0,
                "toComponent": "OR22",
                "toIndex": 1
            },
            {
                "fromComponent": "OR22",
                "fromIndex": 0,
                "toComponent": "OUTPUTS",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 2,
                "toComponent": "AND21",
                "toIndex": 1
            }
        ],
        "x": 749.3940574985974,
        "y": 452.98416262338895,
        "width": 80,
        "height": 62,
        "isSub": false
    },
    {
        "name": "chip1524",
        "externalName": "ADDER",
        "inputs": [
            0,
            0,
            0
        ],
        "outputs": [
            0,
            0
        ],
        "components": [
            {
                "name": "AND18",
                "type": "AND",
                "inputs": [
                    0,
                    0
                ],
                "outputs": [
                    0
                ],
                "x": 755.3999757505527,
                "y": 278.64209880782676,
                "width": 80,
                "height": 62
            },
            {
                "name": "AND21",
                "type": "AND",
                "inputs": [
                    0,
                    0
                ],
                "outputs": [
                    0
                ],
                "x": 350.5929616131067,
                "y": 109.17301417874499,
                "width": 80,
                "height": 62
            },
            {
                "name": "OR22",
                "type": "OR",
                "inputs": [
                    0,
                    0
                ],
                "outputs": [
                    0
                ],
                "x": 572.2053391372594,
                "y": 538.790887191401,
                "width": 80,
                "height": 62
            }
        ],
        "chips": [
            {
                "name": "chip816",
                "inputs": [
                    0,
                    0
                ],
                "outputs": [
                    0
                ],
                "components": [
                    {
                        "name": "OR11",
                        "type": "OR",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 263.62519968049975,
                        "y": 599.8027519716048,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "AND14",
                        "type": "AND",
                        "inputs": [
                            0,
                            1
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 648.7900930025903,
                        "y": 133.09869371988896,
                        "width": 80,
                        "height": 62
                    }
                ],
                "chips": [
                    {
                        "name": "chip012",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            1
                        ],
                        "components": [
                            {
                                "name": "AND1",
                                "type": "AND",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 858.8445522322619,
                                "y": 213.230081379325,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "NOT2",
                                "type": "NOT",
                                "inputs": [
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 133.78037654188574,
                                "y": 445.20699976452636,
                                "width": 80,
                                "height": 40
                            }
                        ],
                        "chips": [],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "AND1",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "AND1",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND1",
                                "fromIndex": 0,
                                "toComponent": "NOT2",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "NOT2",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 694.4508204036046,
                        "y": 476.4368793695667,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    }
                ],
                "connections": [
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "OR11",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "OR11",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "chip012",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "chip012",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "OR11",
                        "fromIndex": 0,
                        "toComponent": "AND14",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip012",
                        "fromIndex": 0,
                        "toComponent": "AND14",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "AND14",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 0
                    }
                ],
                "x": 336.95090329516006,
                "y": 127.6519263953276,
                "width": 80,
                "height": 62,
                "isSub": false
            },
            {
                "name": "chip819",
                "inputs": [
                    0,
                    0
                ],
                "outputs": [
                    0
                ],
                "components": [
                    {
                        "name": "OR11",
                        "type": "OR",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 666.6171472320491,
                        "y": 282.7756771877826,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "AND14",
                        "type": "AND",
                        "inputs": [
                            0,
                            1
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 881.1050986374217,
                        "y": 605.0780726590606,
                        "width": 80,
                        "height": 62
                    }
                ],
                "chips": [
                    {
                        "name": "chip012",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            1
                        ],
                        "components": [
                            {
                                "name": "AND1",
                                "type": "AND",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 428.639068293729,
                                "y": 301.5375952015465,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "NOT2",
                                "type": "NOT",
                                "inputs": [
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 125.81026024866024,
                                "y": 183.6166459214419,
                                "width": 80,
                                "height": 40
                            }
                        ],
                        "chips": [],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "AND1",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "AND1",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND1",
                                "fromIndex": 0,
                                "toComponent": "NOT2",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "NOT2",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 756.883458904775,
                        "y": 565.8828985584781,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    }
                ],
                "connections": [
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "OR11",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "OR11",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "chip012",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "chip012",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "OR11",
                        "fromIndex": 0,
                        "toComponent": "AND14",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip012",
                        "fromIndex": 0,
                        "toComponent": "AND14",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "AND14",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 0
                    }
                ],
                "x": 957.9976188879185,
                "y": 556.6419110364195,
                "width": 80,
                "height": 62,
                "isSub": false
            }
        ],
        "connections": [
            {
                "fromComponent": "INPUTS",
                "fromIndex": 0,
                "toComponent": "chip816",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 1,
                "toComponent": "chip816",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 0,
                "toComponent": "AND18",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 1,
                "toComponent": "AND18",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 2,
                "toComponent": "chip819",
                "toIndex": 1
            },
            {
                "fromComponent": "chip816",
                "fromIndex": 0,
                "toComponent": "chip819",
                "toIndex": 0
            },
            {
                "fromComponent": "chip819",
                "fromIndex": 0,
                "toComponent": "OUTPUTS",
                "toIndex": 0
            },
            {
                "fromComponent": "chip816",
                "fromIndex": 0,
                "toComponent": "AND21",
                "toIndex": 0
            },
            {
                "fromComponent": "AND21",
                "fromIndex": 0,
                "toComponent": "OR22",
                "toIndex": 0
            },
            {
                "fromComponent": "AND18",
                "fromIndex": 0,
                "toComponent": "OR22",
                "toIndex": 1
            },
            {
                "fromComponent": "OR22",
                "fromIndex": 0,
                "toComponent": "OUTPUTS",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 2,
                "toComponent": "AND21",
                "toIndex": 1
            }
        ],
        "x": 578.7437648745404,
        "y": 328.2375737113201,
        "width": 80,
        "height": 84,
        "isSub": true
    },
    {
        "name": "chip1526",
        "externalName": "ADDER",
        "inputs": [
            0,
            0,
            0
        ],
        "outputs": [
            0,
            0
        ],
        "components": [
            {
                "name": "AND18",
                "type": "AND",
                "inputs": [
                    0,
                    0
                ],
                "outputs": [
                    0
                ],
                "x": 508.147450655099,
                "y": 269.7292333059647,
                "width": 80,
                "height": 62
            },
            {
                "name": "AND21",
                "type": "AND",
                "inputs": [
                    0,
                    0
                ],
                "outputs": [
                    0
                ],
                "x": 858.4820305084545,
                "y": 649.1844028763909,
                "width": 80,
                "height": 62
            },
            {
                "name": "OR22",
                "type": "OR",
                "inputs": [
                    0,
                    0
                ],
                "outputs": [
                    0
                ],
                "x": 792.411396000881,
                "y": 300.9583578754467,
                "width": 80,
                "height": 62
            }
        ],
        "chips": [
            {
                "name": "chip816",
                "inputs": [
                    0,
                    0
                ],
                "outputs": [
                    0
                ],
                "components": [
                    {
                        "name": "OR11",
                        "type": "OR",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 884.7973508738838,
                        "y": 300.16846488846875,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "AND14",
                        "type": "AND",
                        "inputs": [
                            0,
                            1
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 495.1304769133628,
                        "y": 616.6188460130403,
                        "width": 80,
                        "height": 62
                    }
                ],
                "chips": [
                    {
                        "name": "chip012",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            1
                        ],
                        "components": [
                            {
                                "name": "AND1",
                                "type": "AND",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 331.9800127513685,
                                "y": 697.478373329948,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "NOT2",
                                "type": "NOT",
                                "inputs": [
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 242.5450960389042,
                                "y": 119.93545561089545,
                                "width": 80,
                                "height": 40
                            }
                        ],
                        "chips": [],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "AND1",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "AND1",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND1",
                                "fromIndex": 0,
                                "toComponent": "NOT2",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "NOT2",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 589.9375722729192,
                        "y": 487.98095809032367,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    }
                ],
                "connections": [
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "OR11",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "OR11",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "chip012",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "chip012",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "OR11",
                        "fromIndex": 0,
                        "toComponent": "AND14",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip012",
                        "fromIndex": 0,
                        "toComponent": "AND14",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "AND14",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 0
                    }
                ],
                "x": 857.2334464389492,
                "y": 371.0121829479792,
                "width": 80,
                "height": 62,
                "isSub": false
            },
            {
                "name": "chip819",
                "inputs": [
                    0,
                    0
                ],
                "outputs": [
                    0
                ],
                "components": [
                    {
                        "name": "OR11",
                        "type": "OR",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 711.4795527073356,
                        "y": 322.4289632391316,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "AND14",
                        "type": "AND",
                        "inputs": [
                            0,
                            1
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 473.5033558143021,
                        "y": 250.53819107159194,
                        "width": 80,
                        "height": 62
                    }
                ],
                "chips": [
                    {
                        "name": "chip012",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            1
                        ],
                        "components": [
                            {
                                "name": "AND1",
                                "type": "AND",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 873.3610936681439,
                                "y": 649.2431634953554,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "NOT2",
                                "type": "NOT",
                                "inputs": [
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 459.3497405029926,
                                "y": 568.1831809604485,
                                "width": 80,
                                "height": 40
                            }
                        ],
                        "chips": [],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "AND1",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "AND1",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND1",
                                "fromIndex": 0,
                                "toComponent": "NOT2",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "NOT2",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 777.7967840992445,
                        "y": 578.9101576369969,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    }
                ],
                "connections": [
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "OR11",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "OR11",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "chip012",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "chip012",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "OR11",
                        "fromIndex": 0,
                        "toComponent": "AND14",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip012",
                        "fromIndex": 0,
                        "toComponent": "AND14",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "AND14",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 0
                    }
                ],
                "x": 631.2848500773397,
                "y": 549.9203295656264,
                "width": 80,
                "height": 62,
                "isSub": false
            }
        ],
        "connections": [
            {
                "fromComponent": "INPUTS",
                "fromIndex": 0,
                "toComponent": "chip816",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 1,
                "toComponent": "chip816",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 0,
                "toComponent": "AND18",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 1,
                "toComponent": "AND18",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 2,
                "toComponent": "chip819",
                "toIndex": 1
            },
            {
                "fromComponent": "chip816",
                "fromIndex": 0,
                "toComponent": "chip819",
                "toIndex": 0
            },
            {
                "fromComponent": "chip819",
                "fromIndex": 0,
                "toComponent": "OUTPUTS",
                "toIndex": 0
            },
            {
                "fromComponent": "chip816",
                "fromIndex": 0,
                "toComponent": "AND21",
                "toIndex": 0
            },
            {
                "fromComponent": "AND21",
                "fromIndex": 0,
                "toComponent": "OR22",
                "toIndex": 0
            },
            {
                "fromComponent": "AND18",
                "fromIndex": 0,
                "toComponent": "OR22",
                "toIndex": 1
            },
            {
                "fromComponent": "OR22",
                "fromIndex": 0,
                "toComponent": "OUTPUTS",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 2,
                "toComponent": "AND21",
                "toIndex": 1
            }
        ],
        "x": 242.70652376590832,
        "y": 592.7685500290685,
        "width": 80,
        "height": 84,
        "isSub": true
    },
    {
        "name": "chip1528",
        "externalName": "ADDER",
        "inputs": [
            0,
            0,
            0
        ],
        "outputs": [
            0,
            0
        ],
        "components": [
            {
                "name": "AND18",
                "type": "AND",
                "inputs": [
                    0,
                    0
                ],
                "outputs": [
                    0
                ],
                "x": 831.3138364575848,
                "y": 244.97038696646774,
                "width": 80,
                "height": 62
            },
            {
                "name": "AND21",
                "type": "AND",
                "inputs": [
                    0,
                    0
                ],
                "outputs": [
                    0
                ],
                "x": 612.726513871378,
                "y": 301.05867211853035,
                "width": 80,
                "height": 62
            },
            {
                "name": "OR22",
                "type": "OR",
                "inputs": [
                    0,
                    0
                ],
                "outputs": [
                    0
                ],
                "x": 525.3961759667928,
                "y": 167.1495096096005,
                "width": 80,
                "height": 62
            }
        ],
        "chips": [
            {
                "name": "chip816",
                "inputs": [
                    0,
                    0
                ],
                "outputs": [
                    0
                ],
                "components": [
                    {
                        "name": "OR11",
                        "type": "OR",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 416.6617312313029,
                        "y": 280.7416470252416,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "AND14",
                        "type": "AND",
                        "inputs": [
                            0,
                            1
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 222.52665630063535,
                        "y": 400.7601692103461,
                        "width": 80,
                        "height": 62
                    }
                ],
                "chips": [
                    {
                        "name": "chip012",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            1
                        ],
                        "components": [
                            {
                                "name": "AND1",
                                "type": "AND",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 376.1229050115659,
                                "y": 168.22661740293702,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "NOT2",
                                "type": "NOT",
                                "inputs": [
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 947.9404296674719,
                                "y": 327.693620988373,
                                "width": 80,
                                "height": 40
                            }
                        ],
                        "chips": [],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "AND1",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "AND1",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND1",
                                "fromIndex": 0,
                                "toComponent": "NOT2",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "NOT2",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 214.85160082632171,
                        "y": 355.3607318685118,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    }
                ],
                "connections": [
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "OR11",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "OR11",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "chip012",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "chip012",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "OR11",
                        "fromIndex": 0,
                        "toComponent": "AND14",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip012",
                        "fromIndex": 0,
                        "toComponent": "AND14",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "AND14",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 0
                    }
                ],
                "x": 481.72126201845384,
                "y": 379.94022572201715,
                "width": 80,
                "height": 62,
                "isSub": false
            },
            {
                "name": "chip819",
                "inputs": [
                    0,
                    0
                ],
                "outputs": [
                    0
                ],
                "components": [
                    {
                        "name": "OR11",
                        "type": "OR",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 787.7167507715762,
                        "y": 103.91306367225167,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "AND14",
                        "type": "AND",
                        "inputs": [
                            0,
                            1
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 178.07007376418522,
                        "y": 666.5871786323887,
                        "width": 80,
                        "height": 62
                    }
                ],
                "chips": [
                    {
                        "name": "chip012",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            1
                        ],
                        "components": [
                            {
                                "name": "AND1",
                                "type": "AND",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 623.7864217247875,
                                "y": 460.0880877626307,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "NOT2",
                                "type": "NOT",
                                "inputs": [
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 608.7685531554785,
                                "y": 589.2491471960933,
                                "width": 80,
                                "height": 40
                            }
                        ],
                        "chips": [],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "AND1",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "AND1",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND1",
                                "fromIndex": 0,
                                "toComponent": "NOT2",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "NOT2",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 601.2799070881208,
                        "y": 302.6011236042991,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    }
                ],
                "connections": [
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "OR11",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "OR11",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "chip012",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "chip012",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "OR11",
                        "fromIndex": 0,
                        "toComponent": "AND14",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip012",
                        "fromIndex": 0,
                        "toComponent": "AND14",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "AND14",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 0
                    }
                ],
                "x": 256.47328650811596,
                "y": 311.8133373511564,
                "width": 80,
                "height": 62,
                "isSub": false
            }
        ],
        "connections": [
            {
                "fromComponent": "INPUTS",
                "fromIndex": 0,
                "toComponent": "chip816",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 1,
                "toComponent": "chip816",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 0,
                "toComponent": "AND18",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 1,
                "toComponent": "AND18",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 2,
                "toComponent": "chip819",
                "toIndex": 1
            },
            {
                "fromComponent": "chip816",
                "fromIndex": 0,
                "toComponent": "chip819",
                "toIndex": 0
            },
            {
                "fromComponent": "chip819",
                "fromIndex": 0,
                "toComponent": "OUTPUTS",
                "toIndex": 0
            },
            {
                "fromComponent": "chip816",
                "fromIndex": 0,
                "toComponent": "AND21",
                "toIndex": 0
            },
            {
                "fromComponent": "AND21",
                "fromIndex": 0,
                "toComponent": "OR22",
                "toIndex": 0
            },
            {
                "fromComponent": "AND18",
                "fromIndex": 0,
                "toComponent": "OR22",
                "toIndex": 1
            },
            {
                "fromComponent": "OR22",
                "fromIndex": 0,
                "toComponent": "OUTPUTS",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 2,
                "toComponent": "AND21",
                "toIndex": 1
            }
        ],
        "x": 731.3735974222345,
        "y": 195.63527499520072,
        "width": 80,
        "height": 84,
        "isSub": true
    },
    {
        "name": "chip1530",
        "externalName": "ADDER",
        "inputs": [
            0,
            0,
            0
        ],
        "outputs": [
            0,
            0
        ],
        "components": [
            {
                "name": "AND18",
                "type": "AND",
                "inputs": [
                    0,
                    0
                ],
                "outputs": [
                    0
                ],
                "x": 450.75898344475513,
                "y": 668.9501082254607,
                "width": 80,
                "height": 62
            },
            {
                "name": "AND21",
                "type": "AND",
                "inputs": [
                    0,
                    0
                ],
                "outputs": [
                    0
                ],
                "x": 558.6412272861811,
                "y": 648.5481932922089,
                "width": 80,
                "height": 62
            },
            {
                "name": "OR22",
                "type": "OR",
                "inputs": [
                    0,
                    0
                ],
                "outputs": [
                    0
                ],
                "x": 508.756756697544,
                "y": 109.28599473430593,
                "width": 80,
                "height": 62
            }
        ],
        "chips": [
            {
                "name": "chip816",
                "inputs": [
                    0,
                    0
                ],
                "outputs": [
                    0
                ],
                "components": [
                    {
                        "name": "OR11",
                        "type": "OR",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 139.22826223997853,
                        "y": 400.9761305801291,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "AND14",
                        "type": "AND",
                        "inputs": [
                            0,
                            1
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 948.1025255496046,
                        "y": 235.4435646750277,
                        "width": 80,
                        "height": 62
                    }
                ],
                "chips": [
                    {
                        "name": "chip012",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            1
                        ],
                        "components": [
                            {
                                "name": "AND1",
                                "type": "AND",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 867.7150176982714,
                                "y": 550.1301351176451,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "NOT2",
                                "type": "NOT",
                                "inputs": [
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 149.41284318228676,
                                "y": 419.1034274600445,
                                "width": 80,
                                "height": 40
                            }
                        ],
                        "chips": [],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "AND1",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "AND1",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND1",
                                "fromIndex": 0,
                                "toComponent": "NOT2",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "NOT2",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 279.00762311186816,
                        "y": 367.00128171429765,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    }
                ],
                "connections": [
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "OR11",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "OR11",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "chip012",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "chip012",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "OR11",
                        "fromIndex": 0,
                        "toComponent": "AND14",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip012",
                        "fromIndex": 0,
                        "toComponent": "AND14",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "AND14",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 0
                    }
                ],
                "x": 257.08393100616263,
                "y": 550.4111959004799,
                "width": 80,
                "height": 62,
                "isSub": false
            },
            {
                "name": "chip819",
                "inputs": [
                    0,
                    0
                ],
                "outputs": [
                    0
                ],
                "components": [
                    {
                        "name": "OR11",
                        "type": "OR",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 380.8735126745667,
                        "y": 359.87886751563934,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "AND14",
                        "type": "AND",
                        "inputs": [
                            0,
                            1
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 229.30844071540156,
                        "y": 415.63282959749307,
                        "width": 80,
                        "height": 62
                    }
                ],
                "chips": [
                    {
                        "name": "chip012",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            1
                        ],
                        "components": [
                            {
                                "name": "AND1",
                                "type": "AND",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 274.5667385792133,
                                "y": 168.49410567843694,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "NOT2",
                                "type": "NOT",
                                "inputs": [
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 734.7199362100722,
                                "y": 194.13305565760515,
                                "width": 80,
                                "height": 40
                            }
                        ],
                        "chips": [],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "AND1",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "AND1",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND1",
                                "fromIndex": 0,
                                "toComponent": "NOT2",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "NOT2",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 953.6525349436183,
                        "y": 207.00757628955927,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    }
                ],
                "connections": [
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "OR11",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "OR11",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "chip012",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "chip012",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "OR11",
                        "fromIndex": 0,
                        "toComponent": "AND14",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip012",
                        "fromIndex": 0,
                        "toComponent": "AND14",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "AND14",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 0
                    }
                ],
                "x": 457.55958559431974,
                "y": 569.7713242820035,
                "width": 80,
                "height": 62,
                "isSub": false
            }
        ],
        "connections": [
            {
                "fromComponent": "INPUTS",
                "fromIndex": 0,
                "toComponent": "chip816",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 1,
                "toComponent": "chip816",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 0,
                "toComponent": "AND18",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 1,
                "toComponent": "AND18",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 2,
                "toComponent": "chip819",
                "toIndex": 1
            },
            {
                "fromComponent": "chip816",
                "fromIndex": 0,
                "toComponent": "chip819",
                "toIndex": 0
            },
            {
                "fromComponent": "chip819",
                "fromIndex": 0,
                "toComponent": "OUTPUTS",
                "toIndex": 0
            },
            {
                "fromComponent": "chip816",
                "fromIndex": 0,
                "toComponent": "AND21",
                "toIndex": 0
            },
            {
                "fromComponent": "AND21",
                "fromIndex": 0,
                "toComponent": "OR22",
                "toIndex": 0
            },
            {
                "fromComponent": "AND18",
                "fromIndex": 0,
                "toComponent": "OR22",
                "toIndex": 1
            },
            {
                "fromComponent": "OR22",
                "fromIndex": 0,
                "toComponent": "OUTPUTS",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 2,
                "toComponent": "AND21",
                "toIndex": 1
            }
        ],
        "x": 428.0214450511302,
        "y": 459.327458088655,
        "width": 80,
        "height": 84,
        "isSub": true
    },
    {
        "name": "chip23",
        "inputs": [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
        ],
        "outputs": [
            0,
            0,
            0,
            0,
            0
        ],
        "components": [],
        "chips": [
            {
                "name": "chip1524",
                "externalName": "ADDER",
                "inputs": [
                    0,
                    0,
                    0
                ],
                "outputs": [
                    0,
                    0
                ],
                "components": [
                    {
                        "name": "AND18",
                        "type": "AND",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 755.3999757505527,
                        "y": 278.64209880782676,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "AND21",
                        "type": "AND",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 350.5929616131067,
                        "y": 109.17301417874499,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "OR22",
                        "type": "OR",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 572.2053391372594,
                        "y": 538.790887191401,
                        "width": 80,
                        "height": 62
                    }
                ],
                "chips": [
                    {
                        "name": "chip816",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "components": [
                            {
                                "name": "OR11",
                                "type": "OR",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 263.62519968049975,
                                "y": 599.8027519716048,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "AND14",
                                "type": "AND",
                                "inputs": [
                                    0,
                                    1
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 648.7900930025903,
                                "y": 133.09869371988896,
                                "width": 80,
                                "height": 62
                            }
                        ],
                        "chips": [
                            {
                                "name": "chip012",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "components": [
                                    {
                                        "name": "AND1",
                                        "type": "AND",
                                        "inputs": [
                                            0,
                                            0
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "x": 858.8445522322619,
                                        "y": 213.230081379325,
                                        "width": 80,
                                        "height": 62
                                    },
                                    {
                                        "name": "NOT2",
                                        "type": "NOT",
                                        "inputs": [
                                            0
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "x": 133.78037654188574,
                                        "y": 445.20699976452636,
                                        "width": 80,
                                        "height": 40
                                    }
                                ],
                                "chips": [],
                                "connections": [
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "AND1",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "AND1",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "AND1",
                                        "fromIndex": 0,
                                        "toComponent": "NOT2",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "NOT2",
                                        "fromIndex": 0,
                                        "toComponent": "OUTPUTS",
                                        "toIndex": 0
                                    }
                                ],
                                "x": 694.4508204036046,
                                "y": 476.4368793695667,
                                "width": 80,
                                "height": 62,
                                "isSub": false
                            }
                        ],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "OR11",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "OR11",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "chip012",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "chip012",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "OR11",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "chip012",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND14",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 336.95090329516006,
                        "y": 127.6519263953276,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    },
                    {
                        "name": "chip819",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "components": [
                            {
                                "name": "OR11",
                                "type": "OR",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 666.6171472320491,
                                "y": 282.7756771877826,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "AND14",
                                "type": "AND",
                                "inputs": [
                                    0,
                                    1
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 881.1050986374217,
                                "y": 605.0780726590606,
                                "width": 80,
                                "height": 62
                            }
                        ],
                        "chips": [
                            {
                                "name": "chip012",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "components": [
                                    {
                                        "name": "AND1",
                                        "type": "AND",
                                        "inputs": [
                                            0,
                                            0
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "x": 428.639068293729,
                                        "y": 301.5375952015465,
                                        "width": 80,
                                        "height": 62
                                    },
                                    {
                                        "name": "NOT2",
                                        "type": "NOT",
                                        "inputs": [
                                            0
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "x": 125.81026024866024,
                                        "y": 183.6166459214419,
                                        "width": 80,
                                        "height": 40
                                    }
                                ],
                                "chips": [],
                                "connections": [
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "AND1",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "AND1",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "AND1",
                                        "fromIndex": 0,
                                        "toComponent": "NOT2",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "NOT2",
                                        "fromIndex": 0,
                                        "toComponent": "OUTPUTS",
                                        "toIndex": 0
                                    }
                                ],
                                "x": 756.883458904775,
                                "y": 565.8828985584781,
                                "width": 80,
                                "height": 62,
                                "isSub": false
                            }
                        ],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "OR11",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "OR11",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "chip012",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "chip012",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "OR11",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "chip012",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND14",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 957.9976188879185,
                        "y": 556.6419110364195,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    }
                ],
                "connections": [
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "chip816",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "chip816",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "AND18",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "AND18",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 2,
                        "toComponent": "chip819",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "chip816",
                        "fromIndex": 0,
                        "toComponent": "chip819",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip819",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip816",
                        "fromIndex": 0,
                        "toComponent": "AND21",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "AND21",
                        "fromIndex": 0,
                        "toComponent": "OR22",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "AND18",
                        "fromIndex": 0,
                        "toComponent": "OR22",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "OR22",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 2,
                        "toComponent": "AND21",
                        "toIndex": 1
                    }
                ],
                "x": 578.7437648745404,
                "y": 328.2375737113201,
                "width": 80,
                "height": 84,
                "isSub": true
            },
            {
                "name": "chip1526",
                "externalName": "ADDER",
                "inputs": [
                    0,
                    0,
                    0
                ],
                "outputs": [
                    0,
                    0
                ],
                "components": [
                    {
                        "name": "AND18",
                        "type": "AND",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 508.147450655099,
                        "y": 269.7292333059647,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "AND21",
                        "type": "AND",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 858.4820305084545,
                        "y": 649.1844028763909,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "OR22",
                        "type": "OR",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 792.411396000881,
                        "y": 300.9583578754467,
                        "width": 80,
                        "height": 62
                    }
                ],
                "chips": [
                    {
                        "name": "chip816",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "components": [
                            {
                                "name": "OR11",
                                "type": "OR",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 884.7973508738838,
                                "y": 300.16846488846875,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "AND14",
                                "type": "AND",
                                "inputs": [
                                    0,
                                    1
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 495.1304769133628,
                                "y": 616.6188460130403,
                                "width": 80,
                                "height": 62
                            }
                        ],
                        "chips": [
                            {
                                "name": "chip012",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "components": [
                                    {
                                        "name": "AND1",
                                        "type": "AND",
                                        "inputs": [
                                            0,
                                            0
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "x": 331.9800127513685,
                                        "y": 697.478373329948,
                                        "width": 80,
                                        "height": 62
                                    },
                                    {
                                        "name": "NOT2",
                                        "type": "NOT",
                                        "inputs": [
                                            0
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "x": 242.5450960389042,
                                        "y": 119.93545561089545,
                                        "width": 80,
                                        "height": 40
                                    }
                                ],
                                "chips": [],
                                "connections": [
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "AND1",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "AND1",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "AND1",
                                        "fromIndex": 0,
                                        "toComponent": "NOT2",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "NOT2",
                                        "fromIndex": 0,
                                        "toComponent": "OUTPUTS",
                                        "toIndex": 0
                                    }
                                ],
                                "x": 589.9375722729192,
                                "y": 487.98095809032367,
                                "width": 80,
                                "height": 62,
                                "isSub": false
                            }
                        ],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "OR11",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "OR11",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "chip012",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "chip012",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "OR11",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "chip012",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND14",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 857.2334464389492,
                        "y": 371.0121829479792,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    },
                    {
                        "name": "chip819",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "components": [
                            {
                                "name": "OR11",
                                "type": "OR",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 711.4795527073356,
                                "y": 322.4289632391316,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "AND14",
                                "type": "AND",
                                "inputs": [
                                    0,
                                    1
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 473.5033558143021,
                                "y": 250.53819107159194,
                                "width": 80,
                                "height": 62
                            }
                        ],
                        "chips": [
                            {
                                "name": "chip012",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "components": [
                                    {
                                        "name": "AND1",
                                        "type": "AND",
                                        "inputs": [
                                            0,
                                            0
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "x": 873.3610936681439,
                                        "y": 649.2431634953554,
                                        "width": 80,
                                        "height": 62
                                    },
                                    {
                                        "name": "NOT2",
                                        "type": "NOT",
                                        "inputs": [
                                            0
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "x": 459.3497405029926,
                                        "y": 568.1831809604485,
                                        "width": 80,
                                        "height": 40
                                    }
                                ],
                                "chips": [],
                                "connections": [
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "AND1",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "AND1",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "AND1",
                                        "fromIndex": 0,
                                        "toComponent": "NOT2",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "NOT2",
                                        "fromIndex": 0,
                                        "toComponent": "OUTPUTS",
                                        "toIndex": 0
                                    }
                                ],
                                "x": 777.7967840992445,
                                "y": 578.9101576369969,
                                "width": 80,
                                "height": 62,
                                "isSub": false
                            }
                        ],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "OR11",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "OR11",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "chip012",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "chip012",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "OR11",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "chip012",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND14",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 631.2848500773397,
                        "y": 549.9203295656264,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    }
                ],
                "connections": [
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "chip816",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "chip816",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "AND18",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "AND18",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 2,
                        "toComponent": "chip819",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "chip816",
                        "fromIndex": 0,
                        "toComponent": "chip819",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip819",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip816",
                        "fromIndex": 0,
                        "toComponent": "AND21",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "AND21",
                        "fromIndex": 0,
                        "toComponent": "OR22",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "AND18",
                        "fromIndex": 0,
                        "toComponent": "OR22",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "OR22",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 2,
                        "toComponent": "AND21",
                        "toIndex": 1
                    }
                ],
                "x": 242.70652376590832,
                "y": 592.7685500290685,
                "width": 80,
                "height": 84,
                "isSub": true
            },
            {
                "name": "chip1528",
                "externalName": "ADDER",
                "inputs": [
                    0,
                    0,
                    0
                ],
                "outputs": [
                    0,
                    0
                ],
                "components": [
                    {
                        "name": "AND18",
                        "type": "AND",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 831.3138364575848,
                        "y": 244.97038696646774,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "AND21",
                        "type": "AND",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 612.726513871378,
                        "y": 301.05867211853035,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "OR22",
                        "type": "OR",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 525.3961759667928,
                        "y": 167.1495096096005,
                        "width": 80,
                        "height": 62
                    }
                ],
                "chips": [
                    {
                        "name": "chip816",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "components": [
                            {
                                "name": "OR11",
                                "type": "OR",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 416.6617312313029,
                                "y": 280.7416470252416,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "AND14",
                                "type": "AND",
                                "inputs": [
                                    0,
                                    1
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 222.52665630063535,
                                "y": 400.7601692103461,
                                "width": 80,
                                "height": 62
                            }
                        ],
                        "chips": [
                            {
                                "name": "chip012",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "components": [
                                    {
                                        "name": "AND1",
                                        "type": "AND",
                                        "inputs": [
                                            0,
                                            0
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "x": 376.1229050115659,
                                        "y": 168.22661740293702,
                                        "width": 80,
                                        "height": 62
                                    },
                                    {
                                        "name": "NOT2",
                                        "type": "NOT",
                                        "inputs": [
                                            0
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "x": 947.9404296674719,
                                        "y": 327.693620988373,
                                        "width": 80,
                                        "height": 40
                                    }
                                ],
                                "chips": [],
                                "connections": [
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "AND1",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "AND1",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "AND1",
                                        "fromIndex": 0,
                                        "toComponent": "NOT2",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "NOT2",
                                        "fromIndex": 0,
                                        "toComponent": "OUTPUTS",
                                        "toIndex": 0
                                    }
                                ],
                                "x": 214.85160082632171,
                                "y": 355.3607318685118,
                                "width": 80,
                                "height": 62,
                                "isSub": false
                            }
                        ],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "OR11",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "OR11",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "chip012",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "chip012",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "OR11",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "chip012",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND14",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 481.72126201845384,
                        "y": 379.94022572201715,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    },
                    {
                        "name": "chip819",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "components": [
                            {
                                "name": "OR11",
                                "type": "OR",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 787.7167507715762,
                                "y": 103.91306367225167,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "AND14",
                                "type": "AND",
                                "inputs": [
                                    0,
                                    1
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 178.07007376418522,
                                "y": 666.5871786323887,
                                "width": 80,
                                "height": 62
                            }
                        ],
                        "chips": [
                            {
                                "name": "chip012",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "components": [
                                    {
                                        "name": "AND1",
                                        "type": "AND",
                                        "inputs": [
                                            0,
                                            0
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "x": 623.7864217247875,
                                        "y": 460.0880877626307,
                                        "width": 80,
                                        "height": 62
                                    },
                                    {
                                        "name": "NOT2",
                                        "type": "NOT",
                                        "inputs": [
                                            0
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "x": 608.7685531554785,
                                        "y": 589.2491471960933,
                                        "width": 80,
                                        "height": 40
                                    }
                                ],
                                "chips": [],
                                "connections": [
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "AND1",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "AND1",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "AND1",
                                        "fromIndex": 0,
                                        "toComponent": "NOT2",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "NOT2",
                                        "fromIndex": 0,
                                        "toComponent": "OUTPUTS",
                                        "toIndex": 0
                                    }
                                ],
                                "x": 601.2799070881208,
                                "y": 302.6011236042991,
                                "width": 80,
                                "height": 62,
                                "isSub": false
                            }
                        ],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "OR11",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "OR11",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "chip012",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "chip012",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "OR11",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "chip012",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND14",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 256.47328650811596,
                        "y": 311.8133373511564,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    }
                ],
                "connections": [
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "chip816",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "chip816",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "AND18",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "AND18",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 2,
                        "toComponent": "chip819",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "chip816",
                        "fromIndex": 0,
                        "toComponent": "chip819",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip819",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip816",
                        "fromIndex": 0,
                        "toComponent": "AND21",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "AND21",
                        "fromIndex": 0,
                        "toComponent": "OR22",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "AND18",
                        "fromIndex": 0,
                        "toComponent": "OR22",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "OR22",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 2,
                        "toComponent": "AND21",
                        "toIndex": 1
                    }
                ],
                "x": 731.3735974222345,
                "y": 195.63527499520072,
                "width": 80,
                "height": 84,
                "isSub": true
            },
            {
                "name": "chip1530",
                "externalName": "ADDER",
                "inputs": [
                    0,
                    0,
                    0
                ],
                "outputs": [
                    0,
                    0
                ],
                "components": [
                    {
                        "name": "AND18",
                        "type": "AND",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 450.75898344475513,
                        "y": 668.9501082254607,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "AND21",
                        "type": "AND",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 558.6412272861811,
                        "y": 648.5481932922089,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "OR22",
                        "type": "OR",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 508.756756697544,
                        "y": 109.28599473430593,
                        "width": 80,
                        "height": 62
                    }
                ],
                "chips": [
                    {
                        "name": "chip816",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "components": [
                            {
                                "name": "OR11",
                                "type": "OR",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 139.22826223997853,
                                "y": 400.9761305801291,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "AND14",
                                "type": "AND",
                                "inputs": [
                                    0,
                                    1
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 948.1025255496046,
                                "y": 235.4435646750277,
                                "width": 80,
                                "height": 62
                            }
                        ],
                        "chips": [
                            {
                                "name": "chip012",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "components": [
                                    {
                                        "name": "AND1",
                                        "type": "AND",
                                        "inputs": [
                                            0,
                                            0
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "x": 867.7150176982714,
                                        "y": 550.1301351176451,
                                        "width": 80,
                                        "height": 62
                                    },
                                    {
                                        "name": "NOT2",
                                        "type": "NOT",
                                        "inputs": [
                                            0
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "x": 149.41284318228676,
                                        "y": 419.1034274600445,
                                        "width": 80,
                                        "height": 40
                                    }
                                ],
                                "chips": [],
                                "connections": [
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "AND1",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "AND1",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "AND1",
                                        "fromIndex": 0,
                                        "toComponent": "NOT2",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "NOT2",
                                        "fromIndex": 0,
                                        "toComponent": "OUTPUTS",
                                        "toIndex": 0
                                    }
                                ],
                                "x": 279.00762311186816,
                                "y": 367.00128171429765,
                                "width": 80,
                                "height": 62,
                                "isSub": false
                            }
                        ],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "OR11",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "OR11",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "chip012",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "chip012",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "OR11",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "chip012",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND14",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 257.08393100616263,
                        "y": 550.4111959004799,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    },
                    {
                        "name": "chip819",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "components": [
                            {
                                "name": "OR11",
                                "type": "OR",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 380.8735126745667,
                                "y": 359.87886751563934,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "AND14",
                                "type": "AND",
                                "inputs": [
                                    0,
                                    1
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 229.30844071540156,
                                "y": 415.63282959749307,
                                "width": 80,
                                "height": 62
                            }
                        ],
                        "chips": [
                            {
                                "name": "chip012",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "components": [
                                    {
                                        "name": "AND1",
                                        "type": "AND",
                                        "inputs": [
                                            0,
                                            0
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "x": 274.5667385792133,
                                        "y": 168.49410567843694,
                                        "width": 80,
                                        "height": 62
                                    },
                                    {
                                        "name": "NOT2",
                                        "type": "NOT",
                                        "inputs": [
                                            0
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "x": 734.7199362100722,
                                        "y": 194.13305565760515,
                                        "width": 80,
                                        "height": 40
                                    }
                                ],
                                "chips": [],
                                "connections": [
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "AND1",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "AND1",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "AND1",
                                        "fromIndex": 0,
                                        "toComponent": "NOT2",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "NOT2",
                                        "fromIndex": 0,
                                        "toComponent": "OUTPUTS",
                                        "toIndex": 0
                                    }
                                ],
                                "x": 953.6525349436183,
                                "y": 207.00757628955927,
                                "width": 80,
                                "height": 62,
                                "isSub": false
                            }
                        ],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "OR11",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "OR11",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "chip012",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "chip012",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "OR11",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "chip012",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND14",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 457.55958559431974,
                        "y": 569.7713242820035,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    }
                ],
                "connections": [
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "chip816",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "chip816",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "AND18",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "AND18",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 2,
                        "toComponent": "chip819",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "chip816",
                        "fromIndex": 0,
                        "toComponent": "chip819",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip819",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip816",
                        "fromIndex": 0,
                        "toComponent": "AND21",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "AND21",
                        "fromIndex": 0,
                        "toComponent": "OR22",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "AND18",
                        "fromIndex": 0,
                        "toComponent": "OR22",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "OR22",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 2,
                        "toComponent": "AND21",
                        "toIndex": 1
                    }
                ],
                "x": 428.0214450511302,
                "y": 459.327458088655,
                "width": 80,
                "height": 84,
                "isSub": true
            }
        ],
        "connections": [
            {
                "fromComponent": "chip1528",
                "fromIndex": 0,
                "toComponent": "OUTPUTS",
                "toIndex": 0
            },
            {
                "fromComponent": "chip1524",
                "fromIndex": 0,
                "toComponent": "OUTPUTS",
                "toIndex": 1
            },
            {
                "fromComponent": "chip1530",
                "fromIndex": 0,
                "toComponent": "OUTPUTS",
                "toIndex": 2
            },
            {
                "fromComponent": "chip1526",
                "fromIndex": 0,
                "toComponent": "OUTPUTS",
                "toIndex": 3
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 8,
                "toComponent": "chip1526",
                "toIndex": 2
            },
            {
                "fromComponent": "chip1526",
                "fromIndex": 1,
                "toComponent": "chip1530",
                "toIndex": 2
            },
            {
                "fromComponent": "chip1530",
                "fromIndex": 1,
                "toComponent": "chip1524",
                "toIndex": 2
            },
            {
                "fromComponent": "chip1524",
                "fromIndex": 1,
                "toComponent": "chip1528",
                "toIndex": 2
            },
            {
                "fromComponent": "chip1528",
                "fromIndex": 1,
                "toComponent": "OUTPUTS",
                "toIndex": 4
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 7,
                "toComponent": "chip1526",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 6,
                "toComponent": "chip1530",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 5,
                "toComponent": "chip1524",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 4,
                "toComponent": "chip1528",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 3,
                "toComponent": "chip1526",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 2,
                "toComponent": "chip1530",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 1,
                "toComponent": "chip1524",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 0,
                "toComponent": "chip1528",
                "toIndex": 0
            }
        ],
        "x": 486.82737229474446,
        "y": 433.0337767349561,
        "width": 80,
        "height": 62,
        "isSub": false
    },
    {
        "name": "chip2333",
        "externalName": "4BIT ADDER",
        "inputs": [
            0,
            0,
            0,
            0,
            1,
            1,
            1,
            1,
            0
        ],
        "outputs": [
            1,
            1,
            1,
            1,
            0
        ],
        "components": [],
        "chips": [
            {
                "name": "chip1524",
                "inputs": [
                    0,
                    1,
                    0
                ],
                "outputs": [
                    1,
                    0
                ],
                "components": [
                    {
                        "name": "AND18",
                        "type": "AND",
                        "inputs": [
                            0,
                            1
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 160.96669710882279,
                        "y": 322.2711898224745,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "AND21",
                        "type": "AND",
                        "inputs": [
                            1,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 993.618455487987,
                        "y": 523.0144796499383,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "OR22",
                        "type": "OR",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 790.7991289904571,
                        "y": 295.0463870247372,
                        "width": 80,
                        "height": 62
                    }
                ],
                "chips": [
                    {
                        "name": "chip816",
                        "inputs": [
                            0,
                            1
                        ],
                        "outputs": [
                            1
                        ],
                        "components": [
                            {
                                "name": "OR11",
                                "type": "OR",
                                "inputs": [
                                    0,
                                    1
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 985.905823608258,
                                "y": 246.72326400523207,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "AND14",
                                "type": "AND",
                                "inputs": [
                                    1,
                                    1
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 483.87278220894063,
                                "y": 224.41232691036888,
                                "width": 80,
                                "height": 62
                            }
                        ],
                        "chips": [
                            {
                                "name": "chip012",
                                "inputs": [
                                    0,
                                    1
                                ],
                                "outputs": [
                                    1
                                ],
                                "components": [
                                    {
                                        "name": "AND1",
                                        "type": "AND",
                                        "inputs": [
                                            0,
                                            1
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "x": 631.905346447029,
                                        "y": 259.6783333758534,
                                        "width": 80,
                                        "height": 62
                                    },
                                    {
                                        "name": "NOT2",
                                        "type": "NOT",
                                        "inputs": [
                                            0
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "x": 831.8056477898986,
                                        "y": 418.10799195190106,
                                        "width": 80,
                                        "height": 40
                                    }
                                ],
                                "chips": [],
                                "connections": [
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "AND1",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "AND1",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "AND1",
                                        "fromIndex": 0,
                                        "toComponent": "NOT2",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "NOT2",
                                        "fromIndex": 0,
                                        "toComponent": "OUTPUTS",
                                        "toIndex": 0
                                    }
                                ],
                                "x": 568.5609791640985,
                                "y": 238.55144101482213,
                                "width": 80,
                                "height": 62,
                                "isSub": false
                            }
                        ],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "OR11",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "OR11",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "chip012",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "chip012",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "OR11",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "chip012",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND14",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 179.8825689569335,
                        "y": 204.0963468839947,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    },
                    {
                        "name": "chip819",
                        "inputs": [
                            1,
                            0
                        ],
                        "outputs": [
                            1
                        ],
                        "components": [
                            {
                                "name": "OR11",
                                "type": "OR",
                                "inputs": [
                                    1,
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 285.82623366755706,
                                "y": 305.66110847654465,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "AND14",
                                "type": "AND",
                                "inputs": [
                                    1,
                                    1
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 989.0487147367062,
                                "y": 248.41675126633422,
                                "width": 80,
                                "height": 62
                            }
                        ],
                        "chips": [
                            {
                                "name": "chip012",
                                "inputs": [
                                    1,
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "components": [
                                    {
                                        "name": "AND1",
                                        "type": "AND",
                                        "inputs": [
                                            1,
                                            0
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "x": 982.8570544871956,
                                        "y": 453.07791620668667,
                                        "width": 80,
                                        "height": 62
                                    },
                                    {
                                        "name": "NOT2",
                                        "type": "NOT",
                                        "inputs": [
                                            0
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "x": 326.2608720426841,
                                        "y": 598.7119919285099,
                                        "width": 80,
                                        "height": 40
                                    }
                                ],
                                "chips": [],
                                "connections": [
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "AND1",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "AND1",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "AND1",
                                        "fromIndex": 0,
                                        "toComponent": "NOT2",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "NOT2",
                                        "fromIndex": 0,
                                        "toComponent": "OUTPUTS",
                                        "toIndex": 0
                                    }
                                ],
                                "x": 725.028455548349,
                                "y": 325.92474939244244,
                                "width": 80,
                                "height": 62,
                                "isSub": false
                            }
                        ],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "OR11",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "OR11",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "chip012",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "chip012",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "OR11",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "chip012",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND14",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 422.9376486785258,
                        "y": 381.58857643895476,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    }
                ],
                "connections": [
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "chip816",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "chip816",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "AND18",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "AND18",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 2,
                        "toComponent": "chip819",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "chip816",
                        "fromIndex": 0,
                        "toComponent": "chip819",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip819",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip816",
                        "fromIndex": 0,
                        "toComponent": "AND21",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "AND21",
                        "fromIndex": 0,
                        "toComponent": "OR22",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "AND18",
                        "fromIndex": 0,
                        "toComponent": "OR22",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "OR22",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 2,
                        "toComponent": "AND21",
                        "toIndex": 1
                    }
                ],
                "x": 903.4602838119088,
                "y": 232.30971309227817,
                "width": 80,
                "height": 84,
                "isSub": false
            },
            {
                "name": "chip1526",
                "inputs": [
                    0,
                    1,
                    0
                ],
                "outputs": [
                    1,
                    0
                ],
                "components": [
                    {
                        "name": "AND18",
                        "type": "AND",
                        "inputs": [
                            0,
                            1
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 631.9830175401596,
                        "y": 394.7156191950041,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "AND21",
                        "type": "AND",
                        "inputs": [
                            1,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 974.9371247246353,
                        "y": 542.0790595918995,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "OR22",
                        "type": "OR",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 583.8783173346839,
                        "y": 405.01871456226104,
                        "width": 80,
                        "height": 62
                    }
                ],
                "chips": [
                    {
                        "name": "chip816",
                        "inputs": [
                            0,
                            1
                        ],
                        "outputs": [
                            1
                        ],
                        "components": [
                            {
                                "name": "OR11",
                                "type": "OR",
                                "inputs": [
                                    0,
                                    1
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 499.2379407134233,
                                "y": 493.609568353166,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "AND14",
                                "type": "AND",
                                "inputs": [
                                    1,
                                    1
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 718.1041750672706,
                                "y": 585.7996782470641,
                                "width": 80,
                                "height": 62
                            }
                        ],
                        "chips": [
                            {
                                "name": "chip012",
                                "inputs": [
                                    0,
                                    1
                                ],
                                "outputs": [
                                    1
                                ],
                                "components": [
                                    {
                                        "name": "AND1",
                                        "type": "AND",
                                        "inputs": [
                                            0,
                                            1
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "x": 271.05753150870356,
                                        "y": 326.13222180928767,
                                        "width": 80,
                                        "height": 62
                                    },
                                    {
                                        "name": "NOT2",
                                        "type": "NOT",
                                        "inputs": [
                                            0
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "x": 381.5571669002912,
                                        "y": 200.63927917243714,
                                        "width": 80,
                                        "height": 40
                                    }
                                ],
                                "chips": [],
                                "connections": [
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "AND1",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "AND1",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "AND1",
                                        "fromIndex": 0,
                                        "toComponent": "NOT2",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "NOT2",
                                        "fromIndex": 0,
                                        "toComponent": "OUTPUTS",
                                        "toIndex": 0
                                    }
                                ],
                                "x": 308.9316753596884,
                                "y": 576.6609607160974,
                                "width": 80,
                                "height": 62,
                                "isSub": false
                            }
                        ],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "OR11",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "OR11",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "chip012",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "chip012",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "OR11",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "chip012",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND14",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 468.7693416351396,
                        "y": 273.30930024180117,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    },
                    {
                        "name": "chip819",
                        "inputs": [
                            1,
                            0
                        ],
                        "outputs": [
                            1
                        ],
                        "components": [
                            {
                                "name": "OR11",
                                "type": "OR",
                                "inputs": [
                                    1,
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 561.919218474862,
                                "y": 412.7340383765801,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "AND14",
                                "type": "AND",
                                "inputs": [
                                    1,
                                    1
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 552.993079902964,
                                "y": 142.44793122714304,
                                "width": 80,
                                "height": 62
                            }
                        ],
                        "chips": [
                            {
                                "name": "chip012",
                                "inputs": [
                                    1,
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "components": [
                                    {
                                        "name": "AND1",
                                        "type": "AND",
                                        "inputs": [
                                            1,
                                            0
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "x": 965.9447194236857,
                                        "y": 584.9578276570653,
                                        "width": 80,
                                        "height": 62
                                    },
                                    {
                                        "name": "NOT2",
                                        "type": "NOT",
                                        "inputs": [
                                            0
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "x": 378.6227729086892,
                                        "y": 494.48565225499885,
                                        "width": 80,
                                        "height": 40
                                    }
                                ],
                                "chips": [],
                                "connections": [
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "AND1",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "AND1",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "AND1",
                                        "fromIndex": 0,
                                        "toComponent": "NOT2",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "NOT2",
                                        "fromIndex": 0,
                                        "toComponent": "OUTPUTS",
                                        "toIndex": 0
                                    }
                                ],
                                "x": 843.3458245994365,
                                "y": 630.8587410696919,
                                "width": 80,
                                "height": 62,
                                "isSub": false
                            }
                        ],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "OR11",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "OR11",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "chip012",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "chip012",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "OR11",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "chip012",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND14",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 482.73664452003715,
                        "y": 560.9299309167998,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    }
                ],
                "connections": [
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "chip816",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "chip816",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "AND18",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "AND18",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 2,
                        "toComponent": "chip819",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "chip816",
                        "fromIndex": 0,
                        "toComponent": "chip819",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip819",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip816",
                        "fromIndex": 0,
                        "toComponent": "AND21",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "AND21",
                        "fromIndex": 0,
                        "toComponent": "OR22",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "AND18",
                        "fromIndex": 0,
                        "toComponent": "OR22",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "OR22",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 2,
                        "toComponent": "AND21",
                        "toIndex": 1
                    }
                ],
                "x": 459.75653571155544,
                "y": 649.7364290251824,
                "width": 80,
                "height": 84,
                "isSub": false
            },
            {
                "name": "chip1528",
                "inputs": [
                    0,
                    1,
                    0
                ],
                "outputs": [
                    1,
                    0
                ],
                "components": [
                    {
                        "name": "AND18",
                        "type": "AND",
                        "inputs": [
                            0,
                            1
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 464.583762910933,
                        "y": 379.0317941988677,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "AND21",
                        "type": "AND",
                        "inputs": [
                            1,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 992.1818894086985,
                        "y": 673.5183353916824,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "OR22",
                        "type": "OR",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 137.103749984981,
                        "y": 111.95185049106753,
                        "width": 80,
                        "height": 62
                    }
                ],
                "chips": [
                    {
                        "name": "chip816",
                        "inputs": [
                            0,
                            1
                        ],
                        "outputs": [
                            1
                        ],
                        "components": [
                            {
                                "name": "OR11",
                                "type": "OR",
                                "inputs": [
                                    0,
                                    1
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 456.2165803616107,
                                "y": 349.1383450051559,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "AND14",
                                "type": "AND",
                                "inputs": [
                                    1,
                                    1
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 646.967067982508,
                                "y": 486.89007743961776,
                                "width": 80,
                                "height": 62
                            }
                        ],
                        "chips": [
                            {
                                "name": "chip012",
                                "inputs": [
                                    0,
                                    1
                                ],
                                "outputs": [
                                    1
                                ],
                                "components": [
                                    {
                                        "name": "AND1",
                                        "type": "AND",
                                        "inputs": [
                                            0,
                                            1
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "x": 987.4708986852003,
                                        "y": 331.82608104397025,
                                        "width": 80,
                                        "height": 62
                                    },
                                    {
                                        "name": "NOT2",
                                        "type": "NOT",
                                        "inputs": [
                                            0
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "x": 398.9592094003158,
                                        "y": 509.75510586157617,
                                        "width": 80,
                                        "height": 40
                                    }
                                ],
                                "chips": [],
                                "connections": [
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "AND1",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "AND1",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "AND1",
                                        "fromIndex": 0,
                                        "toComponent": "NOT2",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "NOT2",
                                        "fromIndex": 0,
                                        "toComponent": "OUTPUTS",
                                        "toIndex": 0
                                    }
                                ],
                                "x": 699.8195672862279,
                                "y": 159.08528009297635,
                                "width": 80,
                                "height": 62,
                                "isSub": false
                            }
                        ],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "OR11",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "OR11",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "chip012",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "chip012",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "OR11",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "chip012",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND14",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 788.9869473826896,
                        "y": 425.53479411416373,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    },
                    {
                        "name": "chip819",
                        "inputs": [
                            1,
                            0
                        ],
                        "outputs": [
                            1
                        ],
                        "components": [
                            {
                                "name": "OR11",
                                "type": "OR",
                                "inputs": [
                                    1,
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 329.27568687795474,
                                "y": 160.26159596776517,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "AND14",
                                "type": "AND",
                                "inputs": [
                                    1,
                                    1
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 147.6111768470056,
                                "y": 426.4020650172106,
                                "width": 80,
                                "height": 62
                            }
                        ],
                        "chips": [
                            {
                                "name": "chip012",
                                "inputs": [
                                    1,
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "components": [
                                    {
                                        "name": "AND1",
                                        "type": "AND",
                                        "inputs": [
                                            1,
                                            0
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "x": 840.6530624418837,
                                        "y": 655.4290344114079,
                                        "width": 80,
                                        "height": 62
                                    },
                                    {
                                        "name": "NOT2",
                                        "type": "NOT",
                                        "inputs": [
                                            0
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "x": 549.4818246907927,
                                        "y": 228.8643108274949,
                                        "width": 80,
                                        "height": 40
                                    }
                                ],
                                "chips": [],
                                "connections": [
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "AND1",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "AND1",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "AND1",
                                        "fromIndex": 0,
                                        "toComponent": "NOT2",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "NOT2",
                                        "fromIndex": 0,
                                        "toComponent": "OUTPUTS",
                                        "toIndex": 0
                                    }
                                ],
                                "x": 733.8150236065092,
                                "y": 404.7622255082112,
                                "width": 80,
                                "height": 62,
                                "isSub": false
                            }
                        ],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "OR11",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "OR11",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "chip012",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "chip012",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "OR11",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "chip012",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND14",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 285.4195867840692,
                        "y": 611.6223037630039,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    }
                ],
                "connections": [
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "chip816",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "chip816",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "AND18",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "AND18",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 2,
                        "toComponent": "chip819",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "chip816",
                        "fromIndex": 0,
                        "toComponent": "chip819",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip819",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip816",
                        "fromIndex": 0,
                        "toComponent": "AND21",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "AND21",
                        "fromIndex": 0,
                        "toComponent": "OR22",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "AND18",
                        "fromIndex": 0,
                        "toComponent": "OR22",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "OR22",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 2,
                        "toComponent": "AND21",
                        "toIndex": 1
                    }
                ],
                "x": 763.5017302344173,
                "y": 204.37957431845794,
                "width": 80,
                "height": 84,
                "isSub": false
            },
            {
                "name": "chip1530",
                "inputs": [
                    0,
                    1,
                    0
                ],
                "outputs": [
                    1,
                    0
                ],
                "components": [
                    {
                        "name": "AND18",
                        "type": "AND",
                        "inputs": [
                            0,
                            1
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 604.5777525757467,
                        "y": 601.2758056625444,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "AND21",
                        "type": "AND",
                        "inputs": [
                            1,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 419.06807450047353,
                        "y": 431.1495310867525,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "OR22",
                        "type": "OR",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 343.94611316610394,
                        "y": 109.17364091544366,
                        "width": 80,
                        "height": 62
                    }
                ],
                "chips": [
                    {
                        "name": "chip816",
                        "inputs": [
                            0,
                            1
                        ],
                        "outputs": [
                            1
                        ],
                        "components": [
                            {
                                "name": "OR11",
                                "type": "OR",
                                "inputs": [
                                    0,
                                    1
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 442.8896424483183,
                                "y": 353.3695570308023,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "AND14",
                                "type": "AND",
                                "inputs": [
                                    1,
                                    1
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 254.8289201391314,
                                "y": 521.7624868885873,
                                "width": 80,
                                "height": 62
                            }
                        ],
                        "chips": [
                            {
                                "name": "chip012",
                                "inputs": [
                                    0,
                                    1
                                ],
                                "outputs": [
                                    1
                                ],
                                "components": [
                                    {
                                        "name": "AND1",
                                        "type": "AND",
                                        "inputs": [
                                            0,
                                            1
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "x": 151.06429142070698,
                                        "y": 202.23203772123455,
                                        "width": 80,
                                        "height": 62
                                    },
                                    {
                                        "name": "NOT2",
                                        "type": "NOT",
                                        "inputs": [
                                            0
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "x": 404.03230257699323,
                                        "y": 518.0560215547816,
                                        "width": 80,
                                        "height": 40
                                    }
                                ],
                                "chips": [],
                                "connections": [
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "AND1",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "AND1",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "AND1",
                                        "fromIndex": 0,
                                        "toComponent": "NOT2",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "NOT2",
                                        "fromIndex": 0,
                                        "toComponent": "OUTPUTS",
                                        "toIndex": 0
                                    }
                                ],
                                "x": 891.9868523588794,
                                "y": 321.7342887580246,
                                "width": 80,
                                "height": 62,
                                "isSub": false
                            }
                        ],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "OR11",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "OR11",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "chip012",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "chip012",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "OR11",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "chip012",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND14",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 382.5833893464552,
                        "y": 198.8018137428068,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    },
                    {
                        "name": "chip819",
                        "inputs": [
                            1,
                            0
                        ],
                        "outputs": [
                            1
                        ],
                        "components": [
                            {
                                "name": "OR11",
                                "type": "OR",
                                "inputs": [
                                    1,
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 636.9738363909719,
                                "y": 312.80850245923057,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "AND14",
                                "type": "AND",
                                "inputs": [
                                    1,
                                    1
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 973.0937128638714,
                                "y": 423.5263461098198,
                                "width": 80,
                                "height": 62
                            }
                        ],
                        "chips": [
                            {
                                "name": "chip012",
                                "inputs": [
                                    1,
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "components": [
                                    {
                                        "name": "AND1",
                                        "type": "AND",
                                        "inputs": [
                                            1,
                                            0
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "x": 859.3099026351709,
                                        "y": 311.5303597666884,
                                        "width": 80,
                                        "height": 62
                                    },
                                    {
                                        "name": "NOT2",
                                        "type": "NOT",
                                        "inputs": [
                                            0
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "x": 142.84491009110238,
                                        "y": 404.2557603911152,
                                        "width": 80,
                                        "height": 40
                                    }
                                ],
                                "chips": [],
                                "connections": [
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "AND1",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "AND1",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "AND1",
                                        "fromIndex": 0,
                                        "toComponent": "NOT2",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "NOT2",
                                        "fromIndex": 0,
                                        "toComponent": "OUTPUTS",
                                        "toIndex": 0
                                    }
                                ],
                                "x": 670.001153091136,
                                "y": 274.5556152386216,
                                "width": 80,
                                "height": 62,
                                "isSub": false
                            }
                        ],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "OR11",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "OR11",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "chip012",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "chip012",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "OR11",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "chip012",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND14",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 273.1893599324168,
                        "y": 251.95821033292498,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    }
                ],
                "connections": [
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "chip816",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "chip816",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "AND18",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "AND18",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 2,
                        "toComponent": "chip819",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "chip816",
                        "fromIndex": 0,
                        "toComponent": "chip819",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip819",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip816",
                        "fromIndex": 0,
                        "toComponent": "AND21",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "AND21",
                        "fromIndex": 0,
                        "toComponent": "OR22",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "AND18",
                        "fromIndex": 0,
                        "toComponent": "OR22",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "OR22",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 2,
                        "toComponent": "AND21",
                        "toIndex": 1
                    }
                ],
                "x": 926.7072045374225,
                "y": 631.0965714787981,
                "width": 80,
                "height": 84,
                "isSub": false
            }
        ],
        "connections": [
            {
                "fromComponent": "chip1528",
                "fromIndex": 0,
                "toComponent": "OUTPUTS",
                "toIndex": 0
            },
            {
                "fromComponent": "chip1524",
                "fromIndex": 0,
                "toComponent": "OUTPUTS",
                "toIndex": 1
            },
            {
                "fromComponent": "chip1530",
                "fromIndex": 0,
                "toComponent": "OUTPUTS",
                "toIndex": 2
            },
            {
                "fromComponent": "chip1526",
                "fromIndex": 0,
                "toComponent": "OUTPUTS",
                "toIndex": 3
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 8,
                "toComponent": "chip1526",
                "toIndex": 2
            },
            {
                "fromComponent": "chip1526",
                "fromIndex": 1,
                "toComponent": "chip1530",
                "toIndex": 2
            },
            {
                "fromComponent": "chip1530",
                "fromIndex": 1,
                "toComponent": "chip1524",
                "toIndex": 2
            },
            {
                "fromComponent": "chip1524",
                "fromIndex": 1,
                "toComponent": "chip1528",
                "toIndex": 2
            },
            {
                "fromComponent": "chip1528",
                "fromIndex": 1,
                "toComponent": "OUTPUTS",
                "toIndex": 4
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 7,
                "toComponent": "chip1526",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 6,
                "toComponent": "chip1530",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 5,
                "toComponent": "chip1524",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 4,
                "toComponent": "chip1528",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 3,
                "toComponent": "chip1526",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 2,
                "toComponent": "chip1530",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 1,
                "toComponent": "chip1524",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 0,
                "toComponent": "chip1528",
                "toIndex": 0
            }
        ],
        "x": 402.41867752752523,
        "y": 299.26336952781514,
        "width": 80,
        "height": 216,
        "isSub": true
    },
    {
        "name": "chip2340",
        "externalName": "4BIT ADDER",
        "inputs": [
            1,
            1,
            1,
            0,
            1,
            1,
            0,
            0,
            0
        ],
        "outputs": [
            1,
            0,
            1,
            0,
            1
        ],
        "components": [],
        "chips": [
            {
                "name": "chip1524",
                "inputs": [
                    1,
                    1,
                    0
                ],
                "outputs": [
                    0,
                    1
                ],
                "components": [
                    {
                        "name": "AND18",
                        "type": "AND",
                        "inputs": [
                            1,
                            1
                        ],
                        "outputs": [
                            1
                        ],
                        "x": 794.678428876508,
                        "y": 291.3929279458637,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "AND21",
                        "type": "AND",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 636.3524371150619,
                        "y": 114.1875130594161,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "OR22",
                        "type": "OR",
                        "inputs": [
                            0,
                            1
                        ],
                        "outputs": [
                            1
                        ],
                        "x": 674.576940264048,
                        "y": 650.8691768398671,
                        "width": 80,
                        "height": 62
                    }
                ],
                "chips": [
                    {
                        "name": "chip816",
                        "inputs": [
                            1,
                            1
                        ],
                        "outputs": [
                            0
                        ],
                        "components": [
                            {
                                "name": "OR11",
                                "type": "OR",
                                "inputs": [
                                    1,
                                    1
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 937.2296207984297,
                                "y": 324.6033075895865,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "AND14",
                                "type": "AND",
                                "inputs": [
                                    1,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 888.4215339686649,
                                "y": 200.62093142650417,
                                "width": 80,
                                "height": 62
                            }
                        ],
                        "chips": [
                            {
                                "name": "chip012",
                                "inputs": [
                                    1,
                                    1
                                ],
                                "outputs": [
                                    0
                                ],
                                "components": [
                                    {
                                        "name": "AND1",
                                        "type": "AND",
                                        "inputs": [
                                            1,
                                            1
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "x": 805.0229448346304,
                                        "y": 494.2649119273803,
                                        "width": 80,
                                        "height": 62
                                    },
                                    {
                                        "name": "NOT2",
                                        "type": "NOT",
                                        "inputs": [
                                            1
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "x": 430.0961632307272,
                                        "y": 128.74669850515886,
                                        "width": 80,
                                        "height": 40
                                    }
                                ],
                                "chips": [],
                                "connections": [
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "AND1",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "AND1",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "AND1",
                                        "fromIndex": 0,
                                        "toComponent": "NOT2",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "NOT2",
                                        "fromIndex": 0,
                                        "toComponent": "OUTPUTS",
                                        "toIndex": 0
                                    }
                                ],
                                "x": 512.8242342648384,
                                "y": 468.2708568780357,
                                "width": 80,
                                "height": 62,
                                "isSub": false
                            }
                        ],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "OR11",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "OR11",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "chip012",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "chip012",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "OR11",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "chip012",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND14",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 930.5512401787827,
                        "y": 588.1572371647529,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    },
                    {
                        "name": "chip819",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "components": [
                            {
                                "name": "OR11",
                                "type": "OR",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 523.3789566441118,
                                "y": 376.9052274369504,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "AND14",
                                "type": "AND",
                                "inputs": [
                                    0,
                                    1
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 420.3271389008826,
                                "y": 342.2364681169735,
                                "width": 80,
                                "height": 62
                            }
                        ],
                        "chips": [
                            {
                                "name": "chip012",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "components": [
                                    {
                                        "name": "AND1",
                                        "type": "AND",
                                        "inputs": [
                                            0,
                                            0
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "x": 164.10424841438237,
                                        "y": 265.0798452376373,
                                        "width": 80,
                                        "height": 62
                                    },
                                    {
                                        "name": "NOT2",
                                        "type": "NOT",
                                        "inputs": [
                                            0
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "x": 286.0892343590109,
                                        "y": 384.8463804564001,
                                        "width": 80,
                                        "height": 40
                                    }
                                ],
                                "chips": [],
                                "connections": [
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "AND1",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "AND1",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "AND1",
                                        "fromIndex": 0,
                                        "toComponent": "NOT2",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "NOT2",
                                        "fromIndex": 0,
                                        "toComponent": "OUTPUTS",
                                        "toIndex": 0
                                    }
                                ],
                                "x": 229.05642839758235,
                                "y": 588.0429204076925,
                                "width": 80,
                                "height": 62,
                                "isSub": false
                            }
                        ],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "OR11",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "OR11",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "chip012",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "chip012",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "OR11",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "chip012",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND14",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 322.2415552972617,
                        "y": 482.17384083616133,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    }
                ],
                "connections": [
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "chip816",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "chip816",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "AND18",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "AND18",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 2,
                        "toComponent": "chip819",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "chip816",
                        "fromIndex": 0,
                        "toComponent": "chip819",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip819",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip816",
                        "fromIndex": 0,
                        "toComponent": "AND21",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "AND21",
                        "fromIndex": 0,
                        "toComponent": "OR22",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "AND18",
                        "fromIndex": 0,
                        "toComponent": "OR22",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "OR22",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 2,
                        "toComponent": "AND21",
                        "toIndex": 1
                    }
                ],
                "x": 107.70306013888077,
                "y": 418.54640758534146,
                "width": 80,
                "height": 84,
                "isSub": false
            },
            {
                "name": "chip1526",
                "inputs": [
                    0,
                    0,
                    0
                ],
                "outputs": [
                    0,
                    0
                ],
                "components": [
                    {
                        "name": "AND18",
                        "type": "AND",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 912.0606587902905,
                        "y": 295.70777328220845,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "AND21",
                        "type": "AND",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 106.50679291296035,
                        "y": 493.33843892646445,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "OR22",
                        "type": "OR",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 816.3235528466522,
                        "y": 385.8312906416918,
                        "width": 80,
                        "height": 62
                    }
                ],
                "chips": [
                    {
                        "name": "chip816",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "components": [
                            {
                                "name": "OR11",
                                "type": "OR",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 707.552485849321,
                                "y": 679.5820224284968,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "AND14",
                                "type": "AND",
                                "inputs": [
                                    0,
                                    1
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 243.37238137906235,
                                "y": 604.3005729094921,
                                "width": 80,
                                "height": 62
                            }
                        ],
                        "chips": [
                            {
                                "name": "chip012",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "components": [
                                    {
                                        "name": "AND1",
                                        "type": "AND",
                                        "inputs": [
                                            0,
                                            0
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "x": 914.3893363895335,
                                        "y": 610.4631176143398,
                                        "width": 80,
                                        "height": 62
                                    },
                                    {
                                        "name": "NOT2",
                                        "type": "NOT",
                                        "inputs": [
                                            0
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "x": 276.46114152038774,
                                        "y": 605.975358595439,
                                        "width": 80,
                                        "height": 40
                                    }
                                ],
                                "chips": [],
                                "connections": [
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "AND1",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "AND1",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "AND1",
                                        "fromIndex": 0,
                                        "toComponent": "NOT2",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "NOT2",
                                        "fromIndex": 0,
                                        "toComponent": "OUTPUTS",
                                        "toIndex": 0
                                    }
                                ],
                                "x": 751.3486323812114,
                                "y": 458.92691368919316,
                                "width": 80,
                                "height": 62,
                                "isSub": false
                            }
                        ],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "OR11",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "OR11",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "chip012",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "chip012",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "OR11",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "chip012",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND14",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 628.9069566142498,
                        "y": 475.3198130949404,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    },
                    {
                        "name": "chip819",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "components": [
                            {
                                "name": "OR11",
                                "type": "OR",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 963.9394581189164,
                                "y": 441.11135199712857,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "AND14",
                                "type": "AND",
                                "inputs": [
                                    0,
                                    1
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 797.6639831656819,
                                "y": 459.74544096435886,
                                "width": 80,
                                "height": 62
                            }
                        ],
                        "chips": [
                            {
                                "name": "chip012",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "components": [
                                    {
                                        "name": "AND1",
                                        "type": "AND",
                                        "inputs": [
                                            0,
                                            0
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "x": 478.56634623114877,
                                        "y": 120.52805876914601,
                                        "width": 80,
                                        "height": 62
                                    },
                                    {
                                        "name": "NOT2",
                                        "type": "NOT",
                                        "inputs": [
                                            0
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "x": 800.4860970628133,
                                        "y": 537.0779365778658,
                                        "width": 80,
                                        "height": 40
                                    }
                                ],
                                "chips": [],
                                "connections": [
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "AND1",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "AND1",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "AND1",
                                        "fromIndex": 0,
                                        "toComponent": "NOT2",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "NOT2",
                                        "fromIndex": 0,
                                        "toComponent": "OUTPUTS",
                                        "toIndex": 0
                                    }
                                ],
                                "x": 149.62905466762962,
                                "y": 370.30200181650025,
                                "width": 80,
                                "height": 62,
                                "isSub": false
                            }
                        ],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "OR11",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "OR11",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "chip012",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "chip012",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "OR11",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "chip012",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND14",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 712.7169925932786,
                        "y": 232.28020123719898,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    }
                ],
                "connections": [
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "chip816",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "chip816",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "AND18",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "AND18",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 2,
                        "toComponent": "chip819",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "chip816",
                        "fromIndex": 0,
                        "toComponent": "chip819",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip819",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip816",
                        "fromIndex": 0,
                        "toComponent": "AND21",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "AND21",
                        "fromIndex": 0,
                        "toComponent": "OR22",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "AND18",
                        "fromIndex": 0,
                        "toComponent": "OR22",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "OR22",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 2,
                        "toComponent": "AND21",
                        "toIndex": 1
                    }
                ],
                "x": 331.17670351146796,
                "y": 272.6064046628644,
                "width": 80,
                "height": 84,
                "isSub": false
            },
            {
                "name": "chip1528",
                "inputs": [
                    1,
                    1,
                    1
                ],
                "outputs": [
                    1,
                    1
                ],
                "components": [
                    {
                        "name": "AND18",
                        "type": "AND",
                        "inputs": [
                            1,
                            1
                        ],
                        "outputs": [
                            1
                        ],
                        "x": 846.9939038881765,
                        "y": 498.9508614703145,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "AND21",
                        "type": "AND",
                        "inputs": [
                            0,
                            1
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 706.7073990292705,
                        "y": 394.76901165287984,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "OR22",
                        "type": "OR",
                        "inputs": [
                            0,
                            1
                        ],
                        "outputs": [
                            1
                        ],
                        "x": 443.4945967045227,
                        "y": 156.31322985440073,
                        "width": 80,
                        "height": 62
                    }
                ],
                "chips": [
                    {
                        "name": "chip816",
                        "inputs": [
                            1,
                            1
                        ],
                        "outputs": [
                            0
                        ],
                        "components": [
                            {
                                "name": "OR11",
                                "type": "OR",
                                "inputs": [
                                    1,
                                    1
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 563.7770536631818,
                                "y": 118.66766370373622,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "AND14",
                                "type": "AND",
                                "inputs": [
                                    1,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 735.615643455052,
                                "y": 495.1009112389683,
                                "width": 80,
                                "height": 62
                            }
                        ],
                        "chips": [
                            {
                                "name": "chip012",
                                "inputs": [
                                    1,
                                    1
                                ],
                                "outputs": [
                                    0
                                ],
                                "components": [
                                    {
                                        "name": "AND1",
                                        "type": "AND",
                                        "inputs": [
                                            1,
                                            1
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "x": 367.53800871383555,
                                        "y": 257.20174747482736,
                                        "width": 80,
                                        "height": 62
                                    },
                                    {
                                        "name": "NOT2",
                                        "type": "NOT",
                                        "inputs": [
                                            1
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "x": 673.8319761010476,
                                        "y": 253.0826542942406,
                                        "width": 80,
                                        "height": 40
                                    }
                                ],
                                "chips": [],
                                "connections": [
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "AND1",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "AND1",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "AND1",
                                        "fromIndex": 0,
                                        "toComponent": "NOT2",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "NOT2",
                                        "fromIndex": 0,
                                        "toComponent": "OUTPUTS",
                                        "toIndex": 0
                                    }
                                ],
                                "x": 112.18925828147353,
                                "y": 524.6582117385674,
                                "width": 80,
                                "height": 62,
                                "isSub": false
                            }
                        ],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "OR11",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "OR11",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "chip012",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "chip012",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "OR11",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "chip012",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND14",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 545.6533224777626,
                        "y": 375.9443099077885,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    },
                    {
                        "name": "chip819",
                        "inputs": [
                            0,
                            1
                        ],
                        "outputs": [
                            1
                        ],
                        "components": [
                            {
                                "name": "OR11",
                                "type": "OR",
                                "inputs": [
                                    0,
                                    1
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 387.82151685350425,
                                "y": 306.7117516832957,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "AND14",
                                "type": "AND",
                                "inputs": [
                                    1,
                                    1
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 653.408875723549,
                                "y": 414.0733907041833,
                                "width": 80,
                                "height": 62
                            }
                        ],
                        "chips": [
                            {
                                "name": "chip012",
                                "inputs": [
                                    0,
                                    1
                                ],
                                "outputs": [
                                    1
                                ],
                                "components": [
                                    {
                                        "name": "AND1",
                                        "type": "AND",
                                        "inputs": [
                                            0,
                                            1
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "x": 550.0707763319219,
                                        "y": 306.79216469109895,
                                        "width": 80,
                                        "height": 62
                                    },
                                    {
                                        "name": "NOT2",
                                        "type": "NOT",
                                        "inputs": [
                                            0
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "x": 320.0839294019114,
                                        "y": 347.1642061608344,
                                        "width": 80,
                                        "height": 40
                                    }
                                ],
                                "chips": [],
                                "connections": [
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "AND1",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "AND1",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "AND1",
                                        "fromIndex": 0,
                                        "toComponent": "NOT2",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "NOT2",
                                        "fromIndex": 0,
                                        "toComponent": "OUTPUTS",
                                        "toIndex": 0
                                    }
                                ],
                                "x": 964.3944190975808,
                                "y": 613.8444180292616,
                                "width": 80,
                                "height": 62,
                                "isSub": false
                            }
                        ],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "OR11",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "OR11",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "chip012",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "chip012",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "OR11",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "chip012",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND14",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 439.03384889587187,
                        "y": 569.4342788661675,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    }
                ],
                "connections": [
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "chip816",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "chip816",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "AND18",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "AND18",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 2,
                        "toComponent": "chip819",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "chip816",
                        "fromIndex": 0,
                        "toComponent": "chip819",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip819",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip816",
                        "fromIndex": 0,
                        "toComponent": "AND21",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "AND21",
                        "fromIndex": 0,
                        "toComponent": "OR22",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "AND18",
                        "fromIndex": 0,
                        "toComponent": "OR22",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "OR22",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 2,
                        "toComponent": "AND21",
                        "toIndex": 1
                    }
                ],
                "x": 253.1319624387603,
                "y": 207.88164733742084,
                "width": 80,
                "height": 84,
                "isSub": false
            },
            {
                "name": "chip1530",
                "inputs": [
                    1,
                    0,
                    0
                ],
                "outputs": [
                    1,
                    0
                ],
                "components": [
                    {
                        "name": "AND18",
                        "type": "AND",
                        "inputs": [
                            1,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 769.369629554813,
                        "y": 316.7980195345108,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "AND21",
                        "type": "AND",
                        "inputs": [
                            1,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 468.558428986951,
                        "y": 389.126060634486,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "OR22",
                        "type": "OR",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 644.2476251862539,
                        "y": 225.58065616256377,
                        "width": 80,
                        "height": 62
                    }
                ],
                "chips": [
                    {
                        "name": "chip816",
                        "inputs": [
                            1,
                            0
                        ],
                        "outputs": [
                            1
                        ],
                        "components": [
                            {
                                "name": "OR11",
                                "type": "OR",
                                "inputs": [
                                    1,
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 836.3956603371371,
                                "y": 680.2614695720342,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "AND14",
                                "type": "AND",
                                "inputs": [
                                    1,
                                    1
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 884.8417137173064,
                                "y": 105.46814212491742,
                                "width": 80,
                                "height": 62
                            }
                        ],
                        "chips": [
                            {
                                "name": "chip012",
                                "inputs": [
                                    1,
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "components": [
                                    {
                                        "name": "AND1",
                                        "type": "AND",
                                        "inputs": [
                                            1,
                                            0
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "x": 746.1870009585667,
                                        "y": 433.55258674179527,
                                        "width": 80,
                                        "height": 62
                                    },
                                    {
                                        "name": "NOT2",
                                        "type": "NOT",
                                        "inputs": [
                                            0
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "x": 561.4376612847034,
                                        "y": 197.56532740505753,
                                        "width": 80,
                                        "height": 40
                                    }
                                ],
                                "chips": [],
                                "connections": [
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "AND1",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "AND1",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "AND1",
                                        "fromIndex": 0,
                                        "toComponent": "NOT2",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "NOT2",
                                        "fromIndex": 0,
                                        "toComponent": "OUTPUTS",
                                        "toIndex": 0
                                    }
                                ],
                                "x": 794.876359364757,
                                "y": 138.0594618088054,
                                "width": 80,
                                "height": 62,
                                "isSub": false
                            }
                        ],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "OR11",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "OR11",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "chip012",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "chip012",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "OR11",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "chip012",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND14",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 689.0429295389632,
                        "y": 365.2314105617649,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    },
                    {
                        "name": "chip819",
                        "inputs": [
                            1,
                            0
                        ],
                        "outputs": [
                            1
                        ],
                        "components": [
                            {
                                "name": "OR11",
                                "type": "OR",
                                "inputs": [
                                    1,
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 513.5229709851108,
                                "y": 609.782743985957,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "AND14",
                                "type": "AND",
                                "inputs": [
                                    1,
                                    1
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 332.02212289498686,
                                "y": 255.59128656362122,
                                "width": 80,
                                "height": 62
                            }
                        ],
                        "chips": [
                            {
                                "name": "chip012",
                                "inputs": [
                                    1,
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "components": [
                                    {
                                        "name": "AND1",
                                        "type": "AND",
                                        "inputs": [
                                            1,
                                            0
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "x": 353.53080286893896,
                                        "y": 513.1590262407383,
                                        "width": 80,
                                        "height": 62
                                    },
                                    {
                                        "name": "NOT2",
                                        "type": "NOT",
                                        "inputs": [
                                            0
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "x": 169.79182099477535,
                                        "y": 206.15207371496078,
                                        "width": 80,
                                        "height": 40
                                    }
                                ],
                                "chips": [],
                                "connections": [
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "AND1",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "AND1",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "AND1",
                                        "fromIndex": 0,
                                        "toComponent": "NOT2",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "NOT2",
                                        "fromIndex": 0,
                                        "toComponent": "OUTPUTS",
                                        "toIndex": 0
                                    }
                                ],
                                "x": 275.14472923620895,
                                "y": 181.01189019307907,
                                "width": 80,
                                "height": 62,
                                "isSub": false
                            }
                        ],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "OR11",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "OR11",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "chip012",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "chip012",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "OR11",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "chip012",
                                "fromIndex": 0,
                                "toComponent": "AND14",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND14",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 986.8019587282092,
                        "y": 688.5974060940567,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    }
                ],
                "connections": [
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "chip816",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "chip816",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "AND18",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "AND18",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 2,
                        "toComponent": "chip819",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "chip816",
                        "fromIndex": 0,
                        "toComponent": "chip819",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip819",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip816",
                        "fromIndex": 0,
                        "toComponent": "AND21",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "AND21",
                        "fromIndex": 0,
                        "toComponent": "OR22",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "AND18",
                        "fromIndex": 0,
                        "toComponent": "OR22",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "OR22",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 2,
                        "toComponent": "AND21",
                        "toIndex": 1
                    }
                ],
                "x": 522.3558864665345,
                "y": 631.0502733371936,
                "width": 80,
                "height": 84,
                "isSub": false
            }
        ],
        "connections": [
            {
                "fromComponent": "chip1528",
                "fromIndex": 0,
                "toComponent": "OUTPUTS",
                "toIndex": 0
            },
            {
                "fromComponent": "chip1524",
                "fromIndex": 0,
                "toComponent": "OUTPUTS",
                "toIndex": 1
            },
            {
                "fromComponent": "chip1530",
                "fromIndex": 0,
                "toComponent": "OUTPUTS",
                "toIndex": 2
            },
            {
                "fromComponent": "chip1526",
                "fromIndex": 0,
                "toComponent": "OUTPUTS",
                "toIndex": 3
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 8,
                "toComponent": "chip1526",
                "toIndex": 2
            },
            {
                "fromComponent": "chip1526",
                "fromIndex": 1,
                "toComponent": "chip1530",
                "toIndex": 2
            },
            {
                "fromComponent": "chip1530",
                "fromIndex": 1,
                "toComponent": "chip1524",
                "toIndex": 2
            },
            {
                "fromComponent": "chip1524",
                "fromIndex": 1,
                "toComponent": "chip1528",
                "toIndex": 2
            },
            {
                "fromComponent": "chip1528",
                "fromIndex": 1,
                "toComponent": "OUTPUTS",
                "toIndex": 4
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 7,
                "toComponent": "chip1526",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 6,
                "toComponent": "chip1530",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 5,
                "toComponent": "chip1524",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 4,
                "toComponent": "chip1528",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 3,
                "toComponent": "chip1526",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 2,
                "toComponent": "chip1530",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 1,
                "toComponent": "chip1524",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 0,
                "toComponent": "chip1528",
                "toIndex": 0
            }
        ],
        "x": 378.6890464697491,
        "y": 227.11851805541954,
        "width": 80,
        "height": 216,
        "isSub": true
    },
    {
        "name": "chip842",
        "externalName": "XOR",
        "inputs": [
            0,
            0
        ],
        "outputs": [
            0
        ],
        "components": [
            {
                "name": "OR11",
                "type": "OR",
                "inputs": [
                    0,
                    0
                ],
                "outputs": [
                    0
                ],
                "x": 626.933110677444,
                "y": 181.74353727928366,
                "width": 80,
                "height": 62
            },
            {
                "name": "AND14",
                "type": "AND",
                "inputs": [
                    0,
                    1
                ],
                "outputs": [
                    0
                ],
                "x": 822.1650875023965,
                "y": 233.78857410262262,
                "width": 80,
                "height": 62
            }
        ],
        "chips": [
            {
                "name": "chip012",
                "inputs": [
                    0,
                    0
                ],
                "outputs": [
                    1
                ],
                "components": [
                    {
                        "name": "AND1",
                        "type": "AND",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 214.02475292988203,
                        "y": 342.56701145895016,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "NOT2",
                        "type": "NOT",
                        "inputs": [
                            0
                        ],
                        "outputs": [
                            1
                        ],
                        "x": 553.101166598399,
                        "y": 156.02243343232934,
                        "width": 80,
                        "height": 40
                    }
                ],
                "chips": [],
                "connections": [
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "AND1",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "AND1",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "AND1",
                        "fromIndex": 0,
                        "toComponent": "NOT2",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "NOT2",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 0
                    }
                ],
                "x": 333.30548290387014,
                "y": 606.3221434054733,
                "width": 80,
                "height": 62,
                "isSub": false
            }
        ],
        "connections": [
            {
                "fromComponent": "INPUTS",
                "fromIndex": 0,
                "toComponent": "OR11",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 1,
                "toComponent": "OR11",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 1,
                "toComponent": "chip012",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 0,
                "toComponent": "chip012",
                "toIndex": 0
            },
            {
                "fromComponent": "OR11",
                "fromIndex": 0,
                "toComponent": "AND14",
                "toIndex": 0
            },
            {
                "fromComponent": "chip012",
                "fromIndex": 0,
                "toComponent": "AND14",
                "toIndex": 1
            },
            {
                "fromComponent": "AND14",
                "fromIndex": 0,
                "toComponent": "OUTPUTS",
                "toIndex": 0
            }
        ],
        "x": 191.06399584594192,
        "y": 549.903927746453,
        "width": 80,
        "height": 62,
        "isSub": true
    },
    {
        "name": "chip844",
        "externalName": "XOR",
        "inputs": [
            0,
            0
        ],
        "outputs": [
            0
        ],
        "components": [
            {
                "name": "OR11",
                "type": "OR",
                "inputs": [
                    0,
                    0
                ],
                "outputs": [
                    0
                ],
                "x": 269.4751238796533,
                "y": 578.8036719871388,
                "width": 80,
                "height": 62
            },
            {
                "name": "AND14",
                "type": "AND",
                "inputs": [
                    0,
                    1
                ],
                "outputs": [
                    0
                ],
                "x": 697.4414945589657,
                "y": 269.35840937392345,
                "width": 80,
                "height": 62
            }
        ],
        "chips": [
            {
                "name": "chip012",
                "inputs": [
                    0,
                    0
                ],
                "outputs": [
                    1
                ],
                "components": [
                    {
                        "name": "AND1",
                        "type": "AND",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 496.4738691643843,
                        "y": 375.27146752391184,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "NOT2",
                        "type": "NOT",
                        "inputs": [
                            0
                        ],
                        "outputs": [
                            1
                        ],
                        "x": 768.8559962244019,
                        "y": 558.7587380476525,
                        "width": 80,
                        "height": 40
                    }
                ],
                "chips": [],
                "connections": [
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "AND1",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "AND1",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "AND1",
                        "fromIndex": 0,
                        "toComponent": "NOT2",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "NOT2",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 0
                    }
                ],
                "x": 294.35059497157147,
                "y": 126.83821594518703,
                "width": 80,
                "height": 62,
                "isSub": false
            }
        ],
        "connections": [
            {
                "fromComponent": "INPUTS",
                "fromIndex": 0,
                "toComponent": "OR11",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 1,
                "toComponent": "OR11",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 1,
                "toComponent": "chip012",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 0,
                "toComponent": "chip012",
                "toIndex": 0
            },
            {
                "fromComponent": "OR11",
                "fromIndex": 0,
                "toComponent": "AND14",
                "toIndex": 0
            },
            {
                "fromComponent": "chip012",
                "fromIndex": 0,
                "toComponent": "AND14",
                "toIndex": 1
            },
            {
                "fromComponent": "AND14",
                "fromIndex": 0,
                "toComponent": "OUTPUTS",
                "toIndex": 0
            }
        ],
        "x": 192.568278466813,
        "y": 615.5588087354665,
        "width": 80,
        "height": 62,
        "isSub": true
    },
    {
        "name": "chip846",
        "externalName": "XOR",
        "inputs": [
            1,
            0
        ],
        "outputs": [
            1
        ],
        "components": [
            {
                "name": "OR11",
                "type": "OR",
                "inputs": [
                    1,
                    0
                ],
                "outputs": [
                    1
                ],
                "x": 641.9740301313001,
                "y": 451.04628978401735,
                "width": 80,
                "height": 62
            },
            {
                "name": "AND14",
                "type": "AND",
                "inputs": [
                    1,
                    1
                ],
                "outputs": [
                    1
                ],
                "x": 769.3828849955172,
                "y": 600.6011957909045,
                "width": 80,
                "height": 62
            }
        ],
        "chips": [
            {
                "name": "chip012",
                "inputs": [
                    1,
                    0
                ],
                "outputs": [
                    1
                ],
                "components": [
                    {
                        "name": "AND1",
                        "type": "AND",
                        "inputs": [
                            1,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 993.3536105528858,
                        "y": 642.5026128940708,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "NOT2",
                        "type": "NOT",
                        "inputs": [
                            0
                        ],
                        "outputs": [
                            1
                        ],
                        "x": 385.88574575500235,
                        "y": 168.39308748929903,
                        "width": 80,
                        "height": 40
                    }
                ],
                "chips": [],
                "connections": [
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "AND1",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "AND1",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "AND1",
                        "fromIndex": 0,
                        "toComponent": "NOT2",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "NOT2",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 0
                    }
                ],
                "x": 598.7560044803923,
                "y": 312.82956670715487,
                "width": 80,
                "height": 62,
                "isSub": false
            }
        ],
        "connections": [
            {
                "fromComponent": "INPUTS",
                "fromIndex": 0,
                "toComponent": "OR11",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 1,
                "toComponent": "OR11",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 1,
                "toComponent": "chip012",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 0,
                "toComponent": "chip012",
                "toIndex": 0
            },
            {
                "fromComponent": "OR11",
                "fromIndex": 0,
                "toComponent": "AND14",
                "toIndex": 0
            },
            {
                "fromComponent": "chip012",
                "fromIndex": 0,
                "toComponent": "AND14",
                "toIndex": 1
            },
            {
                "fromComponent": "AND14",
                "fromIndex": 0,
                "toComponent": "OUTPUTS",
                "toIndex": 0
            }
        ],
        "x": 191.3002440598151,
        "y": 482.5090925772214,
        "width": 80,
        "height": 62,
        "isSub": true
    },
    {
        "name": "chip848",
        "externalName": "XOR",
        "inputs": [
            1,
            0
        ],
        "outputs": [
            1
        ],
        "components": [
            {
                "name": "OR11",
                "type": "OR",
                "inputs": [
                    1,
                    0
                ],
                "outputs": [
                    1
                ],
                "x": 623.163654083566,
                "y": 125.58163065129358,
                "width": 80,
                "height": 62
            },
            {
                "name": "AND14",
                "type": "AND",
                "inputs": [
                    1,
                    1
                ],
                "outputs": [
                    1
                ],
                "x": 941.773152166082,
                "y": 557.0502150604101,
                "width": 80,
                "height": 62
            }
        ],
        "chips": [
            {
                "name": "chip012",
                "inputs": [
                    1,
                    0
                ],
                "outputs": [
                    1
                ],
                "components": [
                    {
                        "name": "AND1",
                        "type": "AND",
                        "inputs": [
                            1,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 900.4837981067423,
                        "y": 166.8732069191708,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "NOT2",
                        "type": "NOT",
                        "inputs": [
                            0
                        ],
                        "outputs": [
                            1
                        ],
                        "x": 932.0709191370887,
                        "y": 682.2757505815381,
                        "width": 80,
                        "height": 40
                    }
                ],
                "chips": [],
                "connections": [
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "AND1",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "AND1",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "AND1",
                        "fromIndex": 0,
                        "toComponent": "NOT2",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "NOT2",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 0
                    }
                ],
                "x": 926.5333057692504,
                "y": 582.0586131077343,
                "width": 80,
                "height": 62,
                "isSub": false
            }
        ],
        "connections": [
            {
                "fromComponent": "INPUTS",
                "fromIndex": 0,
                "toComponent": "OR11",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 1,
                "toComponent": "OR11",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 1,
                "toComponent": "chip012",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 0,
                "toComponent": "chip012",
                "toIndex": 0
            },
            {
                "fromComponent": "OR11",
                "fromIndex": 0,
                "toComponent": "AND14",
                "toIndex": 0
            },
            {
                "fromComponent": "chip012",
                "fromIndex": 0,
                "toComponent": "AND14",
                "toIndex": 1
            },
            {
                "fromComponent": "AND14",
                "fromIndex": 0,
                "toComponent": "OUTPUTS",
                "toIndex": 0
            }
        ],
        "x": 193.72943202195927,
        "y": 416.4727225330027,
        "width": 80,
        "height": 62,
        "isSub": true
    },
    {
        "name": "chip32",
        "inputs": [
            1,
            1,
            1,
            0,
            1,
            1,
            0,
            0,
            0
        ],
        "outputs": [
            1,
            0,
            1,
            0,
            1,
            1,
            0
        ],
        "components": [
            {
                "name": "DISPLAY50",
                "type": "DISPLAY",
                "inputs": [
                    1,
                    0,
                    1,
                    0
                ],
                "outputs": [],
                "x": 635.9867652170417,
                "y": 63.2601191922148,
                "width": 100,
                "height": 106
            },
            {
                "name": "NOT51",
                "type": "NOT",
                "inputs": [
                    1
                ],
                "outputs": [
                    0
                ],
                "x": 593.4388696025098,
                "y": 527.7292574220714,
                "width": 80,
                "height": 40
            },
            {
                "name": "NOT52",
                "type": "NOT",
                "inputs": [
                    1
                ],
                "outputs": [
                    0
                ],
                "x": 592.6642002509889,
                "y": 619.2981986679576,
                "width": 80,
                "height": 40
            },
            {
                "name": "NOT53",
                "type": "NOT",
                "inputs": [
                    0
                ],
                "outputs": [
                    1
                ],
                "x": 592.6896427370922,
                "y": 573.5853551768536,
                "width": 80,
                "height": 40
            },
            {
                "name": "NOT54",
                "type": "NOT",
                "inputs": [
                    0
                ],
                "outputs": [
                    1
                ],
                "x": 590.4627353126969,
                "y": 665.1038151388514,
                "width": 80,
                "height": 40
            },
            {
                "name": "AND55",
                "type": "AND",
                "inputs": [
                    0,
                    1
                ],
                "outputs": [
                    0
                ],
                "x": 709.9680844341842,
                "y": 569.2167861401405,
                "width": 80,
                "height": 62
            },
            {
                "name": "AND56",
                "type": "AND",
                "inputs": [
                    0,
                    0
                ],
                "outputs": [
                    0
                ],
                "x": 815.3830951918012,
                "y": 599.8846515581921,
                "width": 80,
                "height": 62
            },
            {
                "name": "AND57",
                "type": "AND",
                "inputs": [
                    0,
                    1
                ],
                "outputs": [
                    0
                ],
                "x": 919.8271944813716,
                "y": 638.823609162778,
                "width": 80,
                "height": 62
            },
            {
                "name": "DISPLAY58",
                "type": "DISPLAY",
                "inputs": [
                    1,
                    1,
                    1,
                    0
                ],
                "outputs": [],
                "x": 193.358761855569,
                "y": 91.8688927125072,
                "width": 100,
                "height": 106
            },
            {
                "name": "DISPLAY59",
                "type": "DISPLAY",
                "inputs": [
                    1,
                    1,
                    0,
                    0
                ],
                "outputs": [],
                "x": 188.61191612124946,
                "y": 266.9098881841463,
                "width": 100,
                "height": 106
            }
        ],
        "chips": [
            {
                "name": "chip2340",
                "externalName": "4BIT ADDER",
                "inputs": [
                    1,
                    1,
                    1,
                    0,
                    1,
                    1,
                    0,
                    0,
                    0
                ],
                "outputs": [
                    1,
                    0,
                    1,
                    0,
                    1
                ],
                "components": [],
                "chips": [
                    {
                        "name": "chip1524",
                        "inputs": [
                            1,
                            1,
                            0
                        ],
                        "outputs": [
                            0,
                            1
                        ],
                        "components": [
                            {
                                "name": "AND18",
                                "type": "AND",
                                "inputs": [
                                    1,
                                    1
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 794.678428876508,
                                "y": 291.3929279458637,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "AND21",
                                "type": "AND",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 636.3524371150619,
                                "y": 114.1875130594161,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "OR22",
                                "type": "OR",
                                "inputs": [
                                    0,
                                    1
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 674.576940264048,
                                "y": 650.8691768398671,
                                "width": 80,
                                "height": 62
                            }
                        ],
                        "chips": [
                            {
                                "name": "chip816",
                                "inputs": [
                                    1,
                                    1
                                ],
                                "outputs": [
                                    0
                                ],
                                "components": [
                                    {
                                        "name": "OR11",
                                        "type": "OR",
                                        "inputs": [
                                            1,
                                            1
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "x": 937.2296207984297,
                                        "y": 324.6033075895865,
                                        "width": 80,
                                        "height": 62
                                    },
                                    {
                                        "name": "AND14",
                                        "type": "AND",
                                        "inputs": [
                                            1,
                                            0
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "x": 888.4215339686649,
                                        "y": 200.62093142650417,
                                        "width": 80,
                                        "height": 62
                                    }
                                ],
                                "chips": [
                                    {
                                        "name": "chip012",
                                        "inputs": [
                                            1,
                                            1
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "components": [
                                            {
                                                "name": "AND1",
                                                "type": "AND",
                                                "inputs": [
                                                    1,
                                                    1
                                                ],
                                                "outputs": [
                                                    1
                                                ],
                                                "x": 805.0229448346304,
                                                "y": 494.2649119273803,
                                                "width": 80,
                                                "height": 62
                                            },
                                            {
                                                "name": "NOT2",
                                                "type": "NOT",
                                                "inputs": [
                                                    1
                                                ],
                                                "outputs": [
                                                    0
                                                ],
                                                "x": 430.0961632307272,
                                                "y": 128.74669850515886,
                                                "width": 80,
                                                "height": 40
                                            }
                                        ],
                                        "chips": [],
                                        "connections": [
                                            {
                                                "fromComponent": "INPUTS",
                                                "fromIndex": 0,
                                                "toComponent": "AND1",
                                                "toIndex": 0
                                            },
                                            {
                                                "fromComponent": "INPUTS",
                                                "fromIndex": 1,
                                                "toComponent": "AND1",
                                                "toIndex": 1
                                            },
                                            {
                                                "fromComponent": "AND1",
                                                "fromIndex": 0,
                                                "toComponent": "NOT2",
                                                "toIndex": 0
                                            },
                                            {
                                                "fromComponent": "NOT2",
                                                "fromIndex": 0,
                                                "toComponent": "OUTPUTS",
                                                "toIndex": 0
                                            }
                                        ],
                                        "x": 512.8242342648384,
                                        "y": 468.2708568780357,
                                        "width": 80,
                                        "height": 62,
                                        "isSub": false
                                    }
                                ],
                                "connections": [
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "OR11",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "OR11",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "chip012",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "chip012",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "OR11",
                                        "fromIndex": 0,
                                        "toComponent": "AND14",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "chip012",
                                        "fromIndex": 0,
                                        "toComponent": "AND14",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "AND14",
                                        "fromIndex": 0,
                                        "toComponent": "OUTPUTS",
                                        "toIndex": 0
                                    }
                                ],
                                "x": 930.5512401787827,
                                "y": 588.1572371647529,
                                "width": 80,
                                "height": 62,
                                "isSub": false
                            },
                            {
                                "name": "chip819",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "components": [
                                    {
                                        "name": "OR11",
                                        "type": "OR",
                                        "inputs": [
                                            0,
                                            0
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "x": 523.3789566441118,
                                        "y": 376.9052274369504,
                                        "width": 80,
                                        "height": 62
                                    },
                                    {
                                        "name": "AND14",
                                        "type": "AND",
                                        "inputs": [
                                            0,
                                            1
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "x": 420.3271389008826,
                                        "y": 342.2364681169735,
                                        "width": 80,
                                        "height": 62
                                    }
                                ],
                                "chips": [
                                    {
                                        "name": "chip012",
                                        "inputs": [
                                            0,
                                            0
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "components": [
                                            {
                                                "name": "AND1",
                                                "type": "AND",
                                                "inputs": [
                                                    0,
                                                    0
                                                ],
                                                "outputs": [
                                                    0
                                                ],
                                                "x": 164.10424841438237,
                                                "y": 265.0798452376373,
                                                "width": 80,
                                                "height": 62
                                            },
                                            {
                                                "name": "NOT2",
                                                "type": "NOT",
                                                "inputs": [
                                                    0
                                                ],
                                                "outputs": [
                                                    1
                                                ],
                                                "x": 286.0892343590109,
                                                "y": 384.8463804564001,
                                                "width": 80,
                                                "height": 40
                                            }
                                        ],
                                        "chips": [],
                                        "connections": [
                                            {
                                                "fromComponent": "INPUTS",
                                                "fromIndex": 0,
                                                "toComponent": "AND1",
                                                "toIndex": 0
                                            },
                                            {
                                                "fromComponent": "INPUTS",
                                                "fromIndex": 1,
                                                "toComponent": "AND1",
                                                "toIndex": 1
                                            },
                                            {
                                                "fromComponent": "AND1",
                                                "fromIndex": 0,
                                                "toComponent": "NOT2",
                                                "toIndex": 0
                                            },
                                            {
                                                "fromComponent": "NOT2",
                                                "fromIndex": 0,
                                                "toComponent": "OUTPUTS",
                                                "toIndex": 0
                                            }
                                        ],
                                        "x": 229.05642839758235,
                                        "y": 588.0429204076925,
                                        "width": 80,
                                        "height": 62,
                                        "isSub": false
                                    }
                                ],
                                "connections": [
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "OR11",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "OR11",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "chip012",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "chip012",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "OR11",
                                        "fromIndex": 0,
                                        "toComponent": "AND14",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "chip012",
                                        "fromIndex": 0,
                                        "toComponent": "AND14",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "AND14",
                                        "fromIndex": 0,
                                        "toComponent": "OUTPUTS",
                                        "toIndex": 0
                                    }
                                ],
                                "x": 322.2415552972617,
                                "y": 482.17384083616133,
                                "width": 80,
                                "height": 62,
                                "isSub": false
                            }
                        ],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "chip816",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "chip816",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "AND18",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "AND18",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 2,
                                "toComponent": "chip819",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "chip816",
                                "fromIndex": 0,
                                "toComponent": "chip819",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "chip819",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "chip816",
                                "fromIndex": 0,
                                "toComponent": "AND21",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "AND21",
                                "fromIndex": 0,
                                "toComponent": "OR22",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "AND18",
                                "fromIndex": 0,
                                "toComponent": "OR22",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "OR22",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 2,
                                "toComponent": "AND21",
                                "toIndex": 1
                            }
                        ],
                        "x": 107.70306013888077,
                        "y": 418.54640758534146,
                        "width": 80,
                        "height": 84,
                        "isSub": false
                    },
                    {
                        "name": "chip1526",
                        "inputs": [
                            0,
                            0,
                            0
                        ],
                        "outputs": [
                            0,
                            0
                        ],
                        "components": [
                            {
                                "name": "AND18",
                                "type": "AND",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 912.0606587902905,
                                "y": 295.70777328220845,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "AND21",
                                "type": "AND",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 106.50679291296035,
                                "y": 493.33843892646445,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "OR22",
                                "type": "OR",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 816.3235528466522,
                                "y": 385.8312906416918,
                                "width": 80,
                                "height": 62
                            }
                        ],
                        "chips": [
                            {
                                "name": "chip816",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "components": [
                                    {
                                        "name": "OR11",
                                        "type": "OR",
                                        "inputs": [
                                            0,
                                            0
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "x": 707.552485849321,
                                        "y": 679.5820224284968,
                                        "width": 80,
                                        "height": 62
                                    },
                                    {
                                        "name": "AND14",
                                        "type": "AND",
                                        "inputs": [
                                            0,
                                            1
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "x": 243.37238137906235,
                                        "y": 604.3005729094921,
                                        "width": 80,
                                        "height": 62
                                    }
                                ],
                                "chips": [
                                    {
                                        "name": "chip012",
                                        "inputs": [
                                            0,
                                            0
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "components": [
                                            {
                                                "name": "AND1",
                                                "type": "AND",
                                                "inputs": [
                                                    0,
                                                    0
                                                ],
                                                "outputs": [
                                                    0
                                                ],
                                                "x": 914.3893363895335,
                                                "y": 610.4631176143398,
                                                "width": 80,
                                                "height": 62
                                            },
                                            {
                                                "name": "NOT2",
                                                "type": "NOT",
                                                "inputs": [
                                                    0
                                                ],
                                                "outputs": [
                                                    1
                                                ],
                                                "x": 276.46114152038774,
                                                "y": 605.975358595439,
                                                "width": 80,
                                                "height": 40
                                            }
                                        ],
                                        "chips": [],
                                        "connections": [
                                            {
                                                "fromComponent": "INPUTS",
                                                "fromIndex": 0,
                                                "toComponent": "AND1",
                                                "toIndex": 0
                                            },
                                            {
                                                "fromComponent": "INPUTS",
                                                "fromIndex": 1,
                                                "toComponent": "AND1",
                                                "toIndex": 1
                                            },
                                            {
                                                "fromComponent": "AND1",
                                                "fromIndex": 0,
                                                "toComponent": "NOT2",
                                                "toIndex": 0
                                            },
                                            {
                                                "fromComponent": "NOT2",
                                                "fromIndex": 0,
                                                "toComponent": "OUTPUTS",
                                                "toIndex": 0
                                            }
                                        ],
                                        "x": 751.3486323812114,
                                        "y": 458.92691368919316,
                                        "width": 80,
                                        "height": 62,
                                        "isSub": false
                                    }
                                ],
                                "connections": [
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "OR11",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "OR11",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "chip012",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "chip012",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "OR11",
                                        "fromIndex": 0,
                                        "toComponent": "AND14",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "chip012",
                                        "fromIndex": 0,
                                        "toComponent": "AND14",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "AND14",
                                        "fromIndex": 0,
                                        "toComponent": "OUTPUTS",
                                        "toIndex": 0
                                    }
                                ],
                                "x": 628.9069566142498,
                                "y": 475.3198130949404,
                                "width": 80,
                                "height": 62,
                                "isSub": false
                            },
                            {
                                "name": "chip819",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "components": [
                                    {
                                        "name": "OR11",
                                        "type": "OR",
                                        "inputs": [
                                            0,
                                            0
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "x": 963.9394581189164,
                                        "y": 441.11135199712857,
                                        "width": 80,
                                        "height": 62
                                    },
                                    {
                                        "name": "AND14",
                                        "type": "AND",
                                        "inputs": [
                                            0,
                                            1
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "x": 797.6639831656819,
                                        "y": 459.74544096435886,
                                        "width": 80,
                                        "height": 62
                                    }
                                ],
                                "chips": [
                                    {
                                        "name": "chip012",
                                        "inputs": [
                                            0,
                                            0
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "components": [
                                            {
                                                "name": "AND1",
                                                "type": "AND",
                                                "inputs": [
                                                    0,
                                                    0
                                                ],
                                                "outputs": [
                                                    0
                                                ],
                                                "x": 478.56634623114877,
                                                "y": 120.52805876914601,
                                                "width": 80,
                                                "height": 62
                                            },
                                            {
                                                "name": "NOT2",
                                                "type": "NOT",
                                                "inputs": [
                                                    0
                                                ],
                                                "outputs": [
                                                    1
                                                ],
                                                "x": 800.4860970628133,
                                                "y": 537.0779365778658,
                                                "width": 80,
                                                "height": 40
                                            }
                                        ],
                                        "chips": [],
                                        "connections": [
                                            {
                                                "fromComponent": "INPUTS",
                                                "fromIndex": 0,
                                                "toComponent": "AND1",
                                                "toIndex": 0
                                            },
                                            {
                                                "fromComponent": "INPUTS",
                                                "fromIndex": 1,
                                                "toComponent": "AND1",
                                                "toIndex": 1
                                            },
                                            {
                                                "fromComponent": "AND1",
                                                "fromIndex": 0,
                                                "toComponent": "NOT2",
                                                "toIndex": 0
                                            },
                                            {
                                                "fromComponent": "NOT2",
                                                "fromIndex": 0,
                                                "toComponent": "OUTPUTS",
                                                "toIndex": 0
                                            }
                                        ],
                                        "x": 149.62905466762962,
                                        "y": 370.30200181650025,
                                        "width": 80,
                                        "height": 62,
                                        "isSub": false
                                    }
                                ],
                                "connections": [
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "OR11",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "OR11",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "chip012",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "chip012",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "OR11",
                                        "fromIndex": 0,
                                        "toComponent": "AND14",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "chip012",
                                        "fromIndex": 0,
                                        "toComponent": "AND14",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "AND14",
                                        "fromIndex": 0,
                                        "toComponent": "OUTPUTS",
                                        "toIndex": 0
                                    }
                                ],
                                "x": 712.7169925932786,
                                "y": 232.28020123719898,
                                "width": 80,
                                "height": 62,
                                "isSub": false
                            }
                        ],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "chip816",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "chip816",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "AND18",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "AND18",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 2,
                                "toComponent": "chip819",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "chip816",
                                "fromIndex": 0,
                                "toComponent": "chip819",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "chip819",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "chip816",
                                "fromIndex": 0,
                                "toComponent": "AND21",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "AND21",
                                "fromIndex": 0,
                                "toComponent": "OR22",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "AND18",
                                "fromIndex": 0,
                                "toComponent": "OR22",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "OR22",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 2,
                                "toComponent": "AND21",
                                "toIndex": 1
                            }
                        ],
                        "x": 331.17670351146796,
                        "y": 272.6064046628644,
                        "width": 80,
                        "height": 84,
                        "isSub": false
                    },
                    {
                        "name": "chip1528",
                        "inputs": [
                            1,
                            1,
                            1
                        ],
                        "outputs": [
                            1,
                            1
                        ],
                        "components": [
                            {
                                "name": "AND18",
                                "type": "AND",
                                "inputs": [
                                    1,
                                    1
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 846.9939038881765,
                                "y": 498.9508614703145,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "AND21",
                                "type": "AND",
                                "inputs": [
                                    0,
                                    1
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 706.7073990292705,
                                "y": 394.76901165287984,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "OR22",
                                "type": "OR",
                                "inputs": [
                                    0,
                                    1
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 443.4945967045227,
                                "y": 156.31322985440073,
                                "width": 80,
                                "height": 62
                            }
                        ],
                        "chips": [
                            {
                                "name": "chip816",
                                "inputs": [
                                    1,
                                    1
                                ],
                                "outputs": [
                                    0
                                ],
                                "components": [
                                    {
                                        "name": "OR11",
                                        "type": "OR",
                                        "inputs": [
                                            1,
                                            1
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "x": 563.7770536631818,
                                        "y": 118.66766370373622,
                                        "width": 80,
                                        "height": 62
                                    },
                                    {
                                        "name": "AND14",
                                        "type": "AND",
                                        "inputs": [
                                            1,
                                            0
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "x": 735.615643455052,
                                        "y": 495.1009112389683,
                                        "width": 80,
                                        "height": 62
                                    }
                                ],
                                "chips": [
                                    {
                                        "name": "chip012",
                                        "inputs": [
                                            1,
                                            1
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "components": [
                                            {
                                                "name": "AND1",
                                                "type": "AND",
                                                "inputs": [
                                                    1,
                                                    1
                                                ],
                                                "outputs": [
                                                    1
                                                ],
                                                "x": 367.53800871383555,
                                                "y": 257.20174747482736,
                                                "width": 80,
                                                "height": 62
                                            },
                                            {
                                                "name": "NOT2",
                                                "type": "NOT",
                                                "inputs": [
                                                    1
                                                ],
                                                "outputs": [
                                                    0
                                                ],
                                                "x": 673.8319761010476,
                                                "y": 253.0826542942406,
                                                "width": 80,
                                                "height": 40
                                            }
                                        ],
                                        "chips": [],
                                        "connections": [
                                            {
                                                "fromComponent": "INPUTS",
                                                "fromIndex": 0,
                                                "toComponent": "AND1",
                                                "toIndex": 0
                                            },
                                            {
                                                "fromComponent": "INPUTS",
                                                "fromIndex": 1,
                                                "toComponent": "AND1",
                                                "toIndex": 1
                                            },
                                            {
                                                "fromComponent": "AND1",
                                                "fromIndex": 0,
                                                "toComponent": "NOT2",
                                                "toIndex": 0
                                            },
                                            {
                                                "fromComponent": "NOT2",
                                                "fromIndex": 0,
                                                "toComponent": "OUTPUTS",
                                                "toIndex": 0
                                            }
                                        ],
                                        "x": 112.18925828147353,
                                        "y": 524.6582117385674,
                                        "width": 80,
                                        "height": 62,
                                        "isSub": false
                                    }
                                ],
                                "connections": [
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "OR11",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "OR11",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "chip012",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "chip012",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "OR11",
                                        "fromIndex": 0,
                                        "toComponent": "AND14",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "chip012",
                                        "fromIndex": 0,
                                        "toComponent": "AND14",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "AND14",
                                        "fromIndex": 0,
                                        "toComponent": "OUTPUTS",
                                        "toIndex": 0
                                    }
                                ],
                                "x": 545.6533224777626,
                                "y": 375.9443099077885,
                                "width": 80,
                                "height": 62,
                                "isSub": false
                            },
                            {
                                "name": "chip819",
                                "inputs": [
                                    0,
                                    1
                                ],
                                "outputs": [
                                    1
                                ],
                                "components": [
                                    {
                                        "name": "OR11",
                                        "type": "OR",
                                        "inputs": [
                                            0,
                                            1
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "x": 387.82151685350425,
                                        "y": 306.7117516832957,
                                        "width": 80,
                                        "height": 62
                                    },
                                    {
                                        "name": "AND14",
                                        "type": "AND",
                                        "inputs": [
                                            1,
                                            1
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "x": 653.408875723549,
                                        "y": 414.0733907041833,
                                        "width": 80,
                                        "height": 62
                                    }
                                ],
                                "chips": [
                                    {
                                        "name": "chip012",
                                        "inputs": [
                                            0,
                                            1
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "components": [
                                            {
                                                "name": "AND1",
                                                "type": "AND",
                                                "inputs": [
                                                    0,
                                                    1
                                                ],
                                                "outputs": [
                                                    0
                                                ],
                                                "x": 550.0707763319219,
                                                "y": 306.79216469109895,
                                                "width": 80,
                                                "height": 62
                                            },
                                            {
                                                "name": "NOT2",
                                                "type": "NOT",
                                                "inputs": [
                                                    0
                                                ],
                                                "outputs": [
                                                    1
                                                ],
                                                "x": 320.0839294019114,
                                                "y": 347.1642061608344,
                                                "width": 80,
                                                "height": 40
                                            }
                                        ],
                                        "chips": [],
                                        "connections": [
                                            {
                                                "fromComponent": "INPUTS",
                                                "fromIndex": 0,
                                                "toComponent": "AND1",
                                                "toIndex": 0
                                            },
                                            {
                                                "fromComponent": "INPUTS",
                                                "fromIndex": 1,
                                                "toComponent": "AND1",
                                                "toIndex": 1
                                            },
                                            {
                                                "fromComponent": "AND1",
                                                "fromIndex": 0,
                                                "toComponent": "NOT2",
                                                "toIndex": 0
                                            },
                                            {
                                                "fromComponent": "NOT2",
                                                "fromIndex": 0,
                                                "toComponent": "OUTPUTS",
                                                "toIndex": 0
                                            }
                                        ],
                                        "x": 964.3944190975808,
                                        "y": 613.8444180292616,
                                        "width": 80,
                                        "height": 62,
                                        "isSub": false
                                    }
                                ],
                                "connections": [
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "OR11",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "OR11",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "chip012",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "chip012",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "OR11",
                                        "fromIndex": 0,
                                        "toComponent": "AND14",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "chip012",
                                        "fromIndex": 0,
                                        "toComponent": "AND14",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "AND14",
                                        "fromIndex": 0,
                                        "toComponent": "OUTPUTS",
                                        "toIndex": 0
                                    }
                                ],
                                "x": 439.03384889587187,
                                "y": 569.4342788661675,
                                "width": 80,
                                "height": 62,
                                "isSub": false
                            }
                        ],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "chip816",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "chip816",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "AND18",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "AND18",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 2,
                                "toComponent": "chip819",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "chip816",
                                "fromIndex": 0,
                                "toComponent": "chip819",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "chip819",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "chip816",
                                "fromIndex": 0,
                                "toComponent": "AND21",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "AND21",
                                "fromIndex": 0,
                                "toComponent": "OR22",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "AND18",
                                "fromIndex": 0,
                                "toComponent": "OR22",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "OR22",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 2,
                                "toComponent": "AND21",
                                "toIndex": 1
                            }
                        ],
                        "x": 253.1319624387603,
                        "y": 207.88164733742084,
                        "width": 80,
                        "height": 84,
                        "isSub": false
                    },
                    {
                        "name": "chip1530",
                        "inputs": [
                            1,
                            0,
                            0
                        ],
                        "outputs": [
                            1,
                            0
                        ],
                        "components": [
                            {
                                "name": "AND18",
                                "type": "AND",
                                "inputs": [
                                    1,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 769.369629554813,
                                "y": 316.7980195345108,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "AND21",
                                "type": "AND",
                                "inputs": [
                                    1,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 468.558428986951,
                                "y": 389.126060634486,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "OR22",
                                "type": "OR",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 644.2476251862539,
                                "y": 225.58065616256377,
                                "width": 80,
                                "height": 62
                            }
                        ],
                        "chips": [
                            {
                                "name": "chip816",
                                "inputs": [
                                    1,
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "components": [
                                    {
                                        "name": "OR11",
                                        "type": "OR",
                                        "inputs": [
                                            1,
                                            0
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "x": 836.3956603371371,
                                        "y": 680.2614695720342,
                                        "width": 80,
                                        "height": 62
                                    },
                                    {
                                        "name": "AND14",
                                        "type": "AND",
                                        "inputs": [
                                            1,
                                            1
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "x": 884.8417137173064,
                                        "y": 105.46814212491742,
                                        "width": 80,
                                        "height": 62
                                    }
                                ],
                                "chips": [
                                    {
                                        "name": "chip012",
                                        "inputs": [
                                            1,
                                            0
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "components": [
                                            {
                                                "name": "AND1",
                                                "type": "AND",
                                                "inputs": [
                                                    1,
                                                    0
                                                ],
                                                "outputs": [
                                                    0
                                                ],
                                                "x": 746.1870009585667,
                                                "y": 433.55258674179527,
                                                "width": 80,
                                                "height": 62
                                            },
                                            {
                                                "name": "NOT2",
                                                "type": "NOT",
                                                "inputs": [
                                                    0
                                                ],
                                                "outputs": [
                                                    1
                                                ],
                                                "x": 561.4376612847034,
                                                "y": 197.56532740505753,
                                                "width": 80,
                                                "height": 40
                                            }
                                        ],
                                        "chips": [],
                                        "connections": [
                                            {
                                                "fromComponent": "INPUTS",
                                                "fromIndex": 0,
                                                "toComponent": "AND1",
                                                "toIndex": 0
                                            },
                                            {
                                                "fromComponent": "INPUTS",
                                                "fromIndex": 1,
                                                "toComponent": "AND1",
                                                "toIndex": 1
                                            },
                                            {
                                                "fromComponent": "AND1",
                                                "fromIndex": 0,
                                                "toComponent": "NOT2",
                                                "toIndex": 0
                                            },
                                            {
                                                "fromComponent": "NOT2",
                                                "fromIndex": 0,
                                                "toComponent": "OUTPUTS",
                                                "toIndex": 0
                                            }
                                        ],
                                        "x": 794.876359364757,
                                        "y": 138.0594618088054,
                                        "width": 80,
                                        "height": 62,
                                        "isSub": false
                                    }
                                ],
                                "connections": [
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "OR11",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "OR11",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "chip012",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "chip012",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "OR11",
                                        "fromIndex": 0,
                                        "toComponent": "AND14",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "chip012",
                                        "fromIndex": 0,
                                        "toComponent": "AND14",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "AND14",
                                        "fromIndex": 0,
                                        "toComponent": "OUTPUTS",
                                        "toIndex": 0
                                    }
                                ],
                                "x": 689.0429295389632,
                                "y": 365.2314105617649,
                                "width": 80,
                                "height": 62,
                                "isSub": false
                            },
                            {
                                "name": "chip819",
                                "inputs": [
                                    1,
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "components": [
                                    {
                                        "name": "OR11",
                                        "type": "OR",
                                        "inputs": [
                                            1,
                                            0
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "x": 513.5229709851108,
                                        "y": 609.782743985957,
                                        "width": 80,
                                        "height": 62
                                    },
                                    {
                                        "name": "AND14",
                                        "type": "AND",
                                        "inputs": [
                                            1,
                                            1
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "x": 332.02212289498686,
                                        "y": 255.59128656362122,
                                        "width": 80,
                                        "height": 62
                                    }
                                ],
                                "chips": [
                                    {
                                        "name": "chip012",
                                        "inputs": [
                                            1,
                                            0
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "components": [
                                            {
                                                "name": "AND1",
                                                "type": "AND",
                                                "inputs": [
                                                    1,
                                                    0
                                                ],
                                                "outputs": [
                                                    0
                                                ],
                                                "x": 353.53080286893896,
                                                "y": 513.1590262407383,
                                                "width": 80,
                                                "height": 62
                                            },
                                            {
                                                "name": "NOT2",
                                                "type": "NOT",
                                                "inputs": [
                                                    0
                                                ],
                                                "outputs": [
                                                    1
                                                ],
                                                "x": 169.79182099477535,
                                                "y": 206.15207371496078,
                                                "width": 80,
                                                "height": 40
                                            }
                                        ],
                                        "chips": [],
                                        "connections": [
                                            {
                                                "fromComponent": "INPUTS",
                                                "fromIndex": 0,
                                                "toComponent": "AND1",
                                                "toIndex": 0
                                            },
                                            {
                                                "fromComponent": "INPUTS",
                                                "fromIndex": 1,
                                                "toComponent": "AND1",
                                                "toIndex": 1
                                            },
                                            {
                                                "fromComponent": "AND1",
                                                "fromIndex": 0,
                                                "toComponent": "NOT2",
                                                "toIndex": 0
                                            },
                                            {
                                                "fromComponent": "NOT2",
                                                "fromIndex": 0,
                                                "toComponent": "OUTPUTS",
                                                "toIndex": 0
                                            }
                                        ],
                                        "x": 275.14472923620895,
                                        "y": 181.01189019307907,
                                        "width": 80,
                                        "height": 62,
                                        "isSub": false
                                    }
                                ],
                                "connections": [
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "OR11",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "OR11",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "chip012",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "chip012",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "OR11",
                                        "fromIndex": 0,
                                        "toComponent": "AND14",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "chip012",
                                        "fromIndex": 0,
                                        "toComponent": "AND14",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "AND14",
                                        "fromIndex": 0,
                                        "toComponent": "OUTPUTS",
                                        "toIndex": 0
                                    }
                                ],
                                "x": 986.8019587282092,
                                "y": 688.5974060940567,
                                "width": 80,
                                "height": 62,
                                "isSub": false
                            }
                        ],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "chip816",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "chip816",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "AND18",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "AND18",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 2,
                                "toComponent": "chip819",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "chip816",
                                "fromIndex": 0,
                                "toComponent": "chip819",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "chip819",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "chip816",
                                "fromIndex": 0,
                                "toComponent": "AND21",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "AND21",
                                "fromIndex": 0,
                                "toComponent": "OR22",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "AND18",
                                "fromIndex": 0,
                                "toComponent": "OR22",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "OR22",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 2,
                                "toComponent": "AND21",
                                "toIndex": 1
                            }
                        ],
                        "x": 522.3558864665345,
                        "y": 631.0502733371936,
                        "width": 80,
                        "height": 84,
                        "isSub": false
                    }
                ],
                "connections": [
                    {
                        "fromComponent": "chip1528",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip1524",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "chip1530",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 2
                    },
                    {
                        "fromComponent": "chip1526",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 3
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 8,
                        "toComponent": "chip1526",
                        "toIndex": 2
                    },
                    {
                        "fromComponent": "chip1526",
                        "fromIndex": 1,
                        "toComponent": "chip1530",
                        "toIndex": 2
                    },
                    {
                        "fromComponent": "chip1530",
                        "fromIndex": 1,
                        "toComponent": "chip1524",
                        "toIndex": 2
                    },
                    {
                        "fromComponent": "chip1524",
                        "fromIndex": 1,
                        "toComponent": "chip1528",
                        "toIndex": 2
                    },
                    {
                        "fromComponent": "chip1528",
                        "fromIndex": 1,
                        "toComponent": "OUTPUTS",
                        "toIndex": 4
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 7,
                        "toComponent": "chip1526",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 6,
                        "toComponent": "chip1530",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 5,
                        "toComponent": "chip1524",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 4,
                        "toComponent": "chip1528",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 3,
                        "toComponent": "chip1526",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 2,
                        "toComponent": "chip1530",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "chip1524",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "chip1528",
                        "toIndex": 0
                    }
                ],
                "x": 378.6890464697491,
                "y": 227.11851805541954,
                "width": 80,
                "height": 216,
                "isSub": true
            },
            {
                "name": "chip842",
                "externalName": "XOR",
                "inputs": [
                    0,
                    0
                ],
                "outputs": [
                    0
                ],
                "components": [
                    {
                        "name": "OR11",
                        "type": "OR",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 626.933110677444,
                        "y": 181.74353727928366,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "AND14",
                        "type": "AND",
                        "inputs": [
                            0,
                            1
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 822.1650875023965,
                        "y": 233.78857410262262,
                        "width": 80,
                        "height": 62
                    }
                ],
                "chips": [
                    {
                        "name": "chip012",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            1
                        ],
                        "components": [
                            {
                                "name": "AND1",
                                "type": "AND",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 214.02475292988203,
                                "y": 342.56701145895016,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "NOT2",
                                "type": "NOT",
                                "inputs": [
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 553.101166598399,
                                "y": 156.02243343232934,
                                "width": 80,
                                "height": 40
                            }
                        ],
                        "chips": [],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "AND1",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "AND1",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND1",
                                "fromIndex": 0,
                                "toComponent": "NOT2",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "NOT2",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 333.30548290387014,
                        "y": 606.3221434054733,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    }
                ],
                "connections": [
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "OR11",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "OR11",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "chip012",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "chip012",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "OR11",
                        "fromIndex": 0,
                        "toComponent": "AND14",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip012",
                        "fromIndex": 0,
                        "toComponent": "AND14",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "AND14",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 0
                    }
                ],
                "x": 191.06399584594192,
                "y": 549.903927746453,
                "width": 80,
                "height": 62,
                "isSub": true
            },
            {
                "name": "chip844",
                "externalName": "XOR",
                "inputs": [
                    0,
                    0
                ],
                "outputs": [
                    0
                ],
                "components": [
                    {
                        "name": "OR11",
                        "type": "OR",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 269.4751238796533,
                        "y": 578.8036719871388,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "AND14",
                        "type": "AND",
                        "inputs": [
                            0,
                            1
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 697.4414945589657,
                        "y": 269.35840937392345,
                        "width": 80,
                        "height": 62
                    }
                ],
                "chips": [
                    {
                        "name": "chip012",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            1
                        ],
                        "components": [
                            {
                                "name": "AND1",
                                "type": "AND",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 496.4738691643843,
                                "y": 375.27146752391184,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "NOT2",
                                "type": "NOT",
                                "inputs": [
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 768.8559962244019,
                                "y": 558.7587380476525,
                                "width": 80,
                                "height": 40
                            }
                        ],
                        "chips": [],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "AND1",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "AND1",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND1",
                                "fromIndex": 0,
                                "toComponent": "NOT2",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "NOT2",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 294.35059497157147,
                        "y": 126.83821594518703,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    }
                ],
                "connections": [
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "OR11",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "OR11",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "chip012",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "chip012",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "OR11",
                        "fromIndex": 0,
                        "toComponent": "AND14",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip012",
                        "fromIndex": 0,
                        "toComponent": "AND14",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "AND14",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 0
                    }
                ],
                "x": 192.568278466813,
                "y": 615.5588087354665,
                "width": 80,
                "height": 62,
                "isSub": true
            },
            {
                "name": "chip846",
                "externalName": "XOR",
                "inputs": [
                    1,
                    0
                ],
                "outputs": [
                    1
                ],
                "components": [
                    {
                        "name": "OR11",
                        "type": "OR",
                        "inputs": [
                            1,
                            0
                        ],
                        "outputs": [
                            1
                        ],
                        "x": 641.9740301313001,
                        "y": 451.04628978401735,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "AND14",
                        "type": "AND",
                        "inputs": [
                            1,
                            1
                        ],
                        "outputs": [
                            1
                        ],
                        "x": 769.3828849955172,
                        "y": 600.6011957909045,
                        "width": 80,
                        "height": 62
                    }
                ],
                "chips": [
                    {
                        "name": "chip012",
                        "inputs": [
                            1,
                            0
                        ],
                        "outputs": [
                            1
                        ],
                        "components": [
                            {
                                "name": "AND1",
                                "type": "AND",
                                "inputs": [
                                    1,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 993.3536105528858,
                                "y": 642.5026128940708,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "NOT2",
                                "type": "NOT",
                                "inputs": [
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 385.88574575500235,
                                "y": 168.39308748929903,
                                "width": 80,
                                "height": 40
                            }
                        ],
                        "chips": [],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "AND1",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "AND1",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND1",
                                "fromIndex": 0,
                                "toComponent": "NOT2",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "NOT2",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 598.7560044803923,
                        "y": 312.82956670715487,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    }
                ],
                "connections": [
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "OR11",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "OR11",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "chip012",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "chip012",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "OR11",
                        "fromIndex": 0,
                        "toComponent": "AND14",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip012",
                        "fromIndex": 0,
                        "toComponent": "AND14",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "AND14",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 0
                    }
                ],
                "x": 191.3002440598151,
                "y": 482.5090925772214,
                "width": 80,
                "height": 62,
                "isSub": true
            },
            {
                "name": "chip848",
                "externalName": "XOR",
                "inputs": [
                    1,
                    0
                ],
                "outputs": [
                    1
                ],
                "components": [
                    {
                        "name": "OR11",
                        "type": "OR",
                        "inputs": [
                            1,
                            0
                        ],
                        "outputs": [
                            1
                        ],
                        "x": 623.163654083566,
                        "y": 125.58163065129358,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "AND14",
                        "type": "AND",
                        "inputs": [
                            1,
                            1
                        ],
                        "outputs": [
                            1
                        ],
                        "x": 941.773152166082,
                        "y": 557.0502150604101,
                        "width": 80,
                        "height": 62
                    }
                ],
                "chips": [
                    {
                        "name": "chip012",
                        "inputs": [
                            1,
                            0
                        ],
                        "outputs": [
                            1
                        ],
                        "components": [
                            {
                                "name": "AND1",
                                "type": "AND",
                                "inputs": [
                                    1,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 900.4837981067423,
                                "y": 166.8732069191708,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "NOT2",
                                "type": "NOT",
                                "inputs": [
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 932.0709191370887,
                                "y": 682.2757505815381,
                                "width": 80,
                                "height": 40
                            }
                        ],
                        "chips": [],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "AND1",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "AND1",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND1",
                                "fromIndex": 0,
                                "toComponent": "NOT2",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "NOT2",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 926.5333057692504,
                        "y": 582.0586131077343,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    }
                ],
                "connections": [
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "OR11",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "OR11",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "chip012",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "chip012",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "OR11",
                        "fromIndex": 0,
                        "toComponent": "AND14",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip012",
                        "fromIndex": 0,
                        "toComponent": "AND14",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "AND14",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 0
                    }
                ],
                "x": 193.72943202195927,
                "y": 416.4727225330027,
                "width": 80,
                "height": 62,
                "isSub": true
            }
        ],
        "connections": [
            {
                "fromComponent": "INPUTS",
                "fromIndex": 4,
                "toComponent": "chip848",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 5,
                "toComponent": "chip846",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 6,
                "toComponent": "chip842",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 7,
                "toComponent": "chip844",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 8,
                "toComponent": "chip844",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 8,
                "toComponent": "chip842",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 8,
                "toComponent": "chip846",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 8,
                "toComponent": "chip848",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 8,
                "toComponent": "chip2340",
                "toIndex": 8
            },
            {
                "fromComponent": "chip844",
                "fromIndex": 0,
                "toComponent": "chip2340",
                "toIndex": 7
            },
            {
                "fromComponent": "chip842",
                "fromIndex": 0,
                "toComponent": "chip2340",
                "toIndex": 6
            },
            {
                "fromComponent": "chip846",
                "fromIndex": 0,
                "toComponent": "chip2340",
                "toIndex": 5
            },
            {
                "fromComponent": "chip848",
                "fromIndex": 0,
                "toComponent": "chip2340",
                "toIndex": 4
            },
            {
                "fromComponent": "chip2340",
                "fromIndex": 0,
                "toComponent": "DISPLAY50",
                "toIndex": 0
            },
            {
                "fromComponent": "chip2340",
                "fromIndex": 1,
                "toComponent": "DISPLAY50",
                "toIndex": 1
            },
            {
                "fromComponent": "chip2340",
                "fromIndex": 2,
                "toComponent": "DISPLAY50",
                "toIndex": 2
            },
            {
                "fromComponent": "chip2340",
                "fromIndex": 3,
                "toComponent": "DISPLAY50",
                "toIndex": 3
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 3,
                "toComponent": "chip2340",
                "toIndex": 3
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 2,
                "toComponent": "chip2340",
                "toIndex": 2
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 1,
                "toComponent": "chip2340",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 0,
                "toComponent": "chip2340",
                "toIndex": 0
            },
            {
                "fromComponent": "chip2340",
                "fromIndex": 0,
                "toComponent": "OUTPUTS",
                "toIndex": 0
            },
            {
                "fromComponent": "chip2340",
                "fromIndex": 1,
                "toComponent": "OUTPUTS",
                "toIndex": 1
            },
            {
                "fromComponent": "chip2340",
                "fromIndex": 2,
                "toComponent": "OUTPUTS",
                "toIndex": 2
            },
            {
                "fromComponent": "chip2340",
                "fromIndex": 3,
                "toComponent": "OUTPUTS",
                "toIndex": 3
            },
            {
                "fromComponent": "chip2340",
                "fromIndex": 0,
                "toComponent": "NOT51",
                "toIndex": 0
            },
            {
                "fromComponent": "chip2340",
                "fromIndex": 1,
                "toComponent": "NOT53",
                "toIndex": 0
            },
            {
                "fromComponent": "chip2340",
                "fromIndex": 2,
                "toComponent": "NOT52",
                "toIndex": 0
            },
            {
                "fromComponent": "chip2340",
                "fromIndex": 3,
                "toComponent": "NOT54",
                "toIndex": 0
            },
            {
                "fromComponent": "NOT51",
                "fromIndex": 0,
                "toComponent": "AND55",
                "toIndex": 0
            },
            {
                "fromComponent": "NOT53",
                "fromIndex": 0,
                "toComponent": "AND55",
                "toIndex": 1
            },
            {
                "fromComponent": "AND55",
                "fromIndex": 0,
                "toComponent": "AND56",
                "toIndex": 0
            },
            {
                "fromComponent": "NOT52",
                "fromIndex": 0,
                "toComponent": "AND56",
                "toIndex": 1
            },
            {
                "fromComponent": "AND56",
                "fromIndex": 0,
                "toComponent": "AND57",
                "toIndex": 0
            },
            {
                "fromComponent": "NOT54",
                "fromIndex": 0,
                "toComponent": "AND57",
                "toIndex": 1
            },
            {
                "fromComponent": "AND57",
                "fromIndex": 0,
                "toComponent": "OUTPUTS",
                "toIndex": 6
            },
            {
                "fromComponent": "chip2340",
                "fromIndex": 0,
                "toComponent": "OUTPUTS",
                "toIndex": 5
            },
            {
                "fromComponent": "chip2340",
                "fromIndex": 4,
                "toComponent": "OUTPUTS",
                "toIndex": 4
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 0,
                "toComponent": "DISPLAY58",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 1,
                "toComponent": "DISPLAY58",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 2,
                "toComponent": "DISPLAY58",
                "toIndex": 2
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 3,
                "toComponent": "DISPLAY58",
                "toIndex": 3
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 4,
                "toComponent": "DISPLAY59",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 5,
                "toComponent": "DISPLAY59",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 6,
                "toComponent": "DISPLAY59",
                "toIndex": 2
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 7,
                "toComponent": "DISPLAY59",
                "toIndex": 3
            }
        ],
        "x": 989.2612264894182,
        "y": 344.38062215852017,
        "width": 80,
        "height": 62,
        "isSub": false
    },
    {
        "name": "chip3261",
        "externalName": "ALU",
        "inputs": [
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0
        ],
        "outputs": [
            1,
            1,
            0,
            0,
            0,
            1,
            0
        ],
        "components": [
            {
                "name": "DISPLAY50",
                "type": "DISPLAY",
                "inputs": [
                    1,
                    1,
                    0,
                    0
                ],
                "outputs": [
                    0
                ],
                "x": 589.3003262545212,
                "y": 419.75571016205987,
                "width": 80,
                "height": 62
            },
            {
                "name": "NOT51",
                "type": "NOT",
                "inputs": [
                    1
                ],
                "outputs": [
                    0
                ],
                "x": 230.23413832516,
                "y": 264.5505847390576,
                "width": 80,
                "height": 40
            },
            {
                "name": "NOT52",
                "type": "NOT",
                "inputs": [
                    0
                ],
                "outputs": [
                    1
                ],
                "x": 894.2062211008644,
                "y": 136.71183524343311,
                "width": 80,
                "height": 40
            },
            {
                "name": "NOT53",
                "type": "NOT",
                "inputs": [
                    1
                ],
                "outputs": [
                    0
                ],
                "x": 701.9578986453266,
                "y": 376.72134558874046,
                "width": 80,
                "height": 40
            },
            {
                "name": "NOT54",
                "type": "NOT",
                "inputs": [
                    0
                ],
                "outputs": [
                    1
                ],
                "x": 700.0406766170312,
                "y": 236.63880124810933,
                "width": 80,
                "height": 40
            },
            {
                "name": "AND55",
                "type": "AND",
                "inputs": [
                    0,
                    0
                ],
                "outputs": [
                    0
                ],
                "x": 913.8543630283374,
                "y": 655.1120659106482,
                "width": 80,
                "height": 62
            },
            {
                "name": "AND56",
                "type": "AND",
                "inputs": [
                    0,
                    1
                ],
                "outputs": [
                    0
                ],
                "x": 706.481967879942,
                "y": 651.5002013413599,
                "width": 80,
                "height": 62
            },
            {
                "name": "AND57",
                "type": "AND",
                "inputs": [
                    0,
                    1
                ],
                "outputs": [
                    0
                ],
                "x": 486.5863738605072,
                "y": 236.82640106878475,
                "width": 80,
                "height": 62
            },
            {
                "name": "DISPLAY58",
                "type": "DISPLAY",
                "inputs": [
                    1,
                    0,
                    0,
                    0
                ],
                "outputs": [
                    0
                ],
                "x": 210.81624667315867,
                "y": 568.9560601344542,
                "width": 80,
                "height": 62
            },
            {
                "name": "DISPLAY59",
                "type": "DISPLAY",
                "inputs": [
                    0,
                    1,
                    0,
                    0
                ],
                "outputs": [
                    0
                ],
                "x": 824.1924754275462,
                "y": 593.0791980229764,
                "width": 80,
                "height": 62
            }
        ],
        "chips": [
            {
                "name": "chip2340",
                "inputs": [
                    1,
                    0,
                    0,
                    0,
                    0,
                    1,
                    0,
                    0,
                    0
                ],
                "outputs": [
                    1,
                    1,
                    0,
                    0,
                    0
                ],
                "components": [],
                "chips": [
                    {
                        "name": "chip1524",
                        "inputs": [
                            0,
                            1,
                            0
                        ],
                        "outputs": [
                            1,
                            0
                        ],
                        "components": [
                            {
                                "name": "AND18",
                                "type": "AND",
                                "inputs": [
                                    0,
                                    1
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 985.658090693538,
                                "y": 133.25027784711,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "AND21",
                                "type": "AND",
                                "inputs": [
                                    1,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 132.5332627014275,
                                "y": 533.8133867285935,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "OR22",
                                "type": "OR",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 573.7222305575672,
                                "y": 586.4813998955171,
                                "width": 80,
                                "height": 62
                            }
                        ],
                        "chips": [
                            {
                                "name": "chip816",
                                "inputs": [
                                    0,
                                    1
                                ],
                                "outputs": [
                                    1
                                ],
                                "components": [
                                    {
                                        "name": "OR11",
                                        "type": "OR",
                                        "inputs": [
                                            0,
                                            1
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "x": 614.6219989220699,
                                        "y": 434.5784578849383,
                                        "width": 80,
                                        "height": 62
                                    },
                                    {
                                        "name": "AND14",
                                        "type": "AND",
                                        "inputs": [
                                            1,
                                            1
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "x": 525.2227607603083,
                                        "y": 379.7834042713292,
                                        "width": 80,
                                        "height": 62
                                    }
                                ],
                                "chips": [
                                    {
                                        "name": "chip012",
                                        "inputs": [
                                            0,
                                            1
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "components": [
                                            {
                                                "name": "AND1",
                                                "type": "AND",
                                                "inputs": [
                                                    0,
                                                    1
                                                ],
                                                "outputs": [
                                                    0
                                                ],
                                                "x": 498.93633195280927,
                                                "y": 391.2664581755719,
                                                "width": 80,
                                                "height": 62
                                            },
                                            {
                                                "name": "NOT2",
                                                "type": "NOT",
                                                "inputs": [
                                                    0
                                                ],
                                                "outputs": [
                                                    1
                                                ],
                                                "x": 420.6380608681426,
                                                "y": 457.52592682125623,
                                                "width": 80,
                                                "height": 40
                                            }
                                        ],
                                        "chips": [],
                                        "connections": [
                                            {
                                                "fromComponent": "INPUTS",
                                                "fromIndex": 0,
                                                "toComponent": "AND1",
                                                "toIndex": 0
                                            },
                                            {
                                                "fromComponent": "INPUTS",
                                                "fromIndex": 1,
                                                "toComponent": "AND1",
                                                "toIndex": 1
                                            },
                                            {
                                                "fromComponent": "AND1",
                                                "fromIndex": 0,
                                                "toComponent": "NOT2",
                                                "toIndex": 0
                                            },
                                            {
                                                "fromComponent": "NOT2",
                                                "fromIndex": 0,
                                                "toComponent": "OUTPUTS",
                                                "toIndex": 0
                                            }
                                        ],
                                        "x": 431.94399923131044,
                                        "y": 214.87472733988295,
                                        "width": 80,
                                        "height": 62,
                                        "isSub": false
                                    }
                                ],
                                "connections": [
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "OR11",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "OR11",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "chip012",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "chip012",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "OR11",
                                        "fromIndex": 0,
                                        "toComponent": "AND14",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "chip012",
                                        "fromIndex": 0,
                                        "toComponent": "AND14",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "AND14",
                                        "fromIndex": 0,
                                        "toComponent": "OUTPUTS",
                                        "toIndex": 0
                                    }
                                ],
                                "x": 775.8432366723994,
                                "y": 694.9333391566523,
                                "width": 80,
                                "height": 62,
                                "isSub": false
                            },
                            {
                                "name": "chip819",
                                "inputs": [
                                    1,
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "components": [
                                    {
                                        "name": "OR11",
                                        "type": "OR",
                                        "inputs": [
                                            1,
                                            0
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "x": 273.7176234558641,
                                        "y": 307.58872560491267,
                                        "width": 80,
                                        "height": 62
                                    },
                                    {
                                        "name": "AND14",
                                        "type": "AND",
                                        "inputs": [
                                            1,
                                            1
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "x": 721.2166504718905,
                                        "y": 249.07265968583948,
                                        "width": 80,
                                        "height": 62
                                    }
                                ],
                                "chips": [
                                    {
                                        "name": "chip012",
                                        "inputs": [
                                            1,
                                            0
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "components": [
                                            {
                                                "name": "AND1",
                                                "type": "AND",
                                                "inputs": [
                                                    1,
                                                    0
                                                ],
                                                "outputs": [
                                                    0
                                                ],
                                                "x": 685.7249909756049,
                                                "y": 585.1969980823885,
                                                "width": 80,
                                                "height": 62
                                            },
                                            {
                                                "name": "NOT2",
                                                "type": "NOT",
                                                "inputs": [
                                                    0
                                                ],
                                                "outputs": [
                                                    1
                                                ],
                                                "x": 289.50507939900984,
                                                "y": 515.584704569168,
                                                "width": 80,
                                                "height": 40
                                            }
                                        ],
                                        "chips": [],
                                        "connections": [
                                            {
                                                "fromComponent": "INPUTS",
                                                "fromIndex": 0,
                                                "toComponent": "AND1",
                                                "toIndex": 0
                                            },
                                            {
                                                "fromComponent": "INPUTS",
                                                "fromIndex": 1,
                                                "toComponent": "AND1",
                                                "toIndex": 1
                                            },
                                            {
                                                "fromComponent": "AND1",
                                                "fromIndex": 0,
                                                "toComponent": "NOT2",
                                                "toIndex": 0
                                            },
                                            {
                                                "fromComponent": "NOT2",
                                                "fromIndex": 0,
                                                "toComponent": "OUTPUTS",
                                                "toIndex": 0
                                            }
                                        ],
                                        "x": 912.4642212741519,
                                        "y": 612.2389799127475,
                                        "width": 80,
                                        "height": 62,
                                        "isSub": false
                                    }
                                ],
                                "connections": [
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "OR11",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "OR11",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "chip012",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "chip012",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "OR11",
                                        "fromIndex": 0,
                                        "toComponent": "AND14",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "chip012",
                                        "fromIndex": 0,
                                        "toComponent": "AND14",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "AND14",
                                        "fromIndex": 0,
                                        "toComponent": "OUTPUTS",
                                        "toIndex": 0
                                    }
                                ],
                                "x": 543.917795167735,
                                "y": 597.8311680209334,
                                "width": 80,
                                "height": 62,
                                "isSub": false
                            }
                        ],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "chip816",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "chip816",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "AND18",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "AND18",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 2,
                                "toComponent": "chip819",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "chip816",
                                "fromIndex": 0,
                                "toComponent": "chip819",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "chip819",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "chip816",
                                "fromIndex": 0,
                                "toComponent": "AND21",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "AND21",
                                "fromIndex": 0,
                                "toComponent": "OR22",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "AND18",
                                "fromIndex": 0,
                                "toComponent": "OR22",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "OR22",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 2,
                                "toComponent": "AND21",
                                "toIndex": 1
                            }
                        ],
                        "x": 250.08498785869665,
                        "y": 339.5602792563407,
                        "width": 80,
                        "height": 84,
                        "isSub": false
                    },
                    {
                        "name": "chip1526",
                        "inputs": [
                            0,
                            0,
                            0
                        ],
                        "outputs": [
                            0,
                            0
                        ],
                        "components": [
                            {
                                "name": "AND18",
                                "type": "AND",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 199.44629118006347,
                                "y": 238.3539156407963,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "AND21",
                                "type": "AND",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 747.4142981096851,
                                "y": 578.8909180416509,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "OR22",
                                "type": "OR",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 864.532102137645,
                                "y": 258.8862900433744,
                                "width": 80,
                                "height": 62
                            }
                        ],
                        "chips": [
                            {
                                "name": "chip816",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "components": [
                                    {
                                        "name": "OR11",
                                        "type": "OR",
                                        "inputs": [
                                            0,
                                            0
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "x": 963.3562794340035,
                                        "y": 182.8511301634876,
                                        "width": 80,
                                        "height": 62
                                    },
                                    {
                                        "name": "AND14",
                                        "type": "AND",
                                        "inputs": [
                                            0,
                                            1
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "x": 645.2707020763567,
                                        "y": 322.4295068498214,
                                        "width": 80,
                                        "height": 62
                                    }
                                ],
                                "chips": [
                                    {
                                        "name": "chip012",
                                        "inputs": [
                                            0,
                                            0
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "components": [
                                            {
                                                "name": "AND1",
                                                "type": "AND",
                                                "inputs": [
                                                    0,
                                                    0
                                                ],
                                                "outputs": [
                                                    0
                                                ],
                                                "x": 839.8346332874979,
                                                "y": 344.75472099926765,
                                                "width": 80,
                                                "height": 62
                                            },
                                            {
                                                "name": "NOT2",
                                                "type": "NOT",
                                                "inputs": [
                                                    0
                                                ],
                                                "outputs": [
                                                    1
                                                ],
                                                "x": 548.4857075832135,
                                                "y": 454.80600612749544,
                                                "width": 80,
                                                "height": 40
                                            }
                                        ],
                                        "chips": [],
                                        "connections": [
                                            {
                                                "fromComponent": "INPUTS",
                                                "fromIndex": 0,
                                                "toComponent": "AND1",
                                                "toIndex": 0
                                            },
                                            {
                                                "fromComponent": "INPUTS",
                                                "fromIndex": 1,
                                                "toComponent": "AND1",
                                                "toIndex": 1
                                            },
                                            {
                                                "fromComponent": "AND1",
                                                "fromIndex": 0,
                                                "toComponent": "NOT2",
                                                "toIndex": 0
                                            },
                                            {
                                                "fromComponent": "NOT2",
                                                "fromIndex": 0,
                                                "toComponent": "OUTPUTS",
                                                "toIndex": 0
                                            }
                                        ],
                                        "x": 972.047760222638,
                                        "y": 546.7380830380994,
                                        "width": 80,
                                        "height": 62,
                                        "isSub": false
                                    }
                                ],
                                "connections": [
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "OR11",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "OR11",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "chip012",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "chip012",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "OR11",
                                        "fromIndex": 0,
                                        "toComponent": "AND14",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "chip012",
                                        "fromIndex": 0,
                                        "toComponent": "AND14",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "AND14",
                                        "fromIndex": 0,
                                        "toComponent": "OUTPUTS",
                                        "toIndex": 0
                                    }
                                ],
                                "x": 563.5647999405214,
                                "y": 673.0607656478846,
                                "width": 80,
                                "height": 62,
                                "isSub": false
                            },
                            {
                                "name": "chip819",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "components": [
                                    {
                                        "name": "OR11",
                                        "type": "OR",
                                        "inputs": [
                                            0,
                                            0
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "x": 795.2545471382824,
                                        "y": 621.7767389917531,
                                        "width": 80,
                                        "height": 62
                                    },
                                    {
                                        "name": "AND14",
                                        "type": "AND",
                                        "inputs": [
                                            0,
                                            1
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "x": 447.50136461502973,
                                        "y": 333.8822512572948,
                                        "width": 80,
                                        "height": 62
                                    }
                                ],
                                "chips": [
                                    {
                                        "name": "chip012",
                                        "inputs": [
                                            0,
                                            0
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "components": [
                                            {
                                                "name": "AND1",
                                                "type": "AND",
                                                "inputs": [
                                                    0,
                                                    0
                                                ],
                                                "outputs": [
                                                    0
                                                ],
                                                "x": 531.9901031998779,
                                                "y": 690.3261605726759,
                                                "width": 80,
                                                "height": 62
                                            },
                                            {
                                                "name": "NOT2",
                                                "type": "NOT",
                                                "inputs": [
                                                    0
                                                ],
                                                "outputs": [
                                                    1
                                                ],
                                                "x": 157.50737323050333,
                                                "y": 508.1146434825841,
                                                "width": 80,
                                                "height": 40
                                            }
                                        ],
                                        "chips": [],
                                        "connections": [
                                            {
                                                "fromComponent": "INPUTS",
                                                "fromIndex": 0,
                                                "toComponent": "AND1",
                                                "toIndex": 0
                                            },
                                            {
                                                "fromComponent": "INPUTS",
                                                "fromIndex": 1,
                                                "toComponent": "AND1",
                                                "toIndex": 1
                                            },
                                            {
                                                "fromComponent": "AND1",
                                                "fromIndex": 0,
                                                "toComponent": "NOT2",
                                                "toIndex": 0
                                            },
                                            {
                                                "fromComponent": "NOT2",
                                                "fromIndex": 0,
                                                "toComponent": "OUTPUTS",
                                                "toIndex": 0
                                            }
                                        ],
                                        "x": 604.530120039623,
                                        "y": 355.98927776474466,
                                        "width": 80,
                                        "height": 62,
                                        "isSub": false
                                    }
                                ],
                                "connections": [
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "OR11",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "OR11",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "chip012",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "chip012",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "OR11",
                                        "fromIndex": 0,
                                        "toComponent": "AND14",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "chip012",
                                        "fromIndex": 0,
                                        "toComponent": "AND14",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "AND14",
                                        "fromIndex": 0,
                                        "toComponent": "OUTPUTS",
                                        "toIndex": 0
                                    }
                                ],
                                "x": 416.77325117393536,
                                "y": 437.804581974918,
                                "width": 80,
                                "height": 62,
                                "isSub": false
                            }
                        ],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "chip816",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "chip816",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "AND18",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "AND18",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 2,
                                "toComponent": "chip819",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "chip816",
                                "fromIndex": 0,
                                "toComponent": "chip819",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "chip819",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "chip816",
                                "fromIndex": 0,
                                "toComponent": "AND21",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "AND21",
                                "fromIndex": 0,
                                "toComponent": "OR22",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "AND18",
                                "fromIndex": 0,
                                "toComponent": "OR22",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "OR22",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 2,
                                "toComponent": "AND21",
                                "toIndex": 1
                            }
                        ],
                        "x": 405.65894117963643,
                        "y": 604.4510023491735,
                        "width": 80,
                        "height": 84,
                        "isSub": false
                    },
                    {
                        "name": "chip1528",
                        "inputs": [
                            1,
                            0,
                            0
                        ],
                        "outputs": [
                            1,
                            0
                        ],
                        "components": [
                            {
                                "name": "AND18",
                                "type": "AND",
                                "inputs": [
                                    1,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 190.89545712292568,
                                "y": 249.11031251649857,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "AND21",
                                "type": "AND",
                                "inputs": [
                                    1,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 549.5121973734276,
                                "y": 599.4787156686577,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "OR22",
                                "type": "OR",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 155.2911259840837,
                                "y": 597.0915120169727,
                                "width": 80,
                                "height": 62
                            }
                        ],
                        "chips": [
                            {
                                "name": "chip816",
                                "inputs": [
                                    1,
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "components": [
                                    {
                                        "name": "OR11",
                                        "type": "OR",
                                        "inputs": [
                                            1,
                                            0
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "x": 784.4177395771446,
                                        "y": 405.46305465307546,
                                        "width": 80,
                                        "height": 62
                                    },
                                    {
                                        "name": "AND14",
                                        "type": "AND",
                                        "inputs": [
                                            1,
                                            1
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "x": 959.6611540994091,
                                        "y": 471.544807496545,
                                        "width": 80,
                                        "height": 62
                                    }
                                ],
                                "chips": [
                                    {
                                        "name": "chip012",
                                        "inputs": [
                                            1,
                                            0
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "components": [
                                            {
                                                "name": "AND1",
                                                "type": "AND",
                                                "inputs": [
                                                    1,
                                                    0
                                                ],
                                                "outputs": [
                                                    0
                                                ],
                                                "x": 936.0800879721247,
                                                "y": 479.6525609521852,
                                                "width": 80,
                                                "height": 62
                                            },
                                            {
                                                "name": "NOT2",
                                                "type": "NOT",
                                                "inputs": [
                                                    0
                                                ],
                                                "outputs": [
                                                    1
                                                ],
                                                "x": 307.58607612708647,
                                                "y": 516.6901232422564,
                                                "width": 80,
                                                "height": 40
                                            }
                                        ],
                                        "chips": [],
                                        "connections": [
                                            {
                                                "fromComponent": "INPUTS",
                                                "fromIndex": 0,
                                                "toComponent": "AND1",
                                                "toIndex": 0
                                            },
                                            {
                                                "fromComponent": "INPUTS",
                                                "fromIndex": 1,
                                                "toComponent": "AND1",
                                                "toIndex": 1
                                            },
                                            {
                                                "fromComponent": "AND1",
                                                "fromIndex": 0,
                                                "toComponent": "NOT2",
                                                "toIndex": 0
                                            },
                                            {
                                                "fromComponent": "NOT2",
                                                "fromIndex": 0,
                                                "toComponent": "OUTPUTS",
                                                "toIndex": 0
                                            }
                                        ],
                                        "x": 186.79547348074067,
                                        "y": 569.735358198409,
                                        "width": 80,
                                        "height": 62,
                                        "isSub": false
                                    }
                                ],
                                "connections": [
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "OR11",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "OR11",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "chip012",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "chip012",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "OR11",
                                        "fromIndex": 0,
                                        "toComponent": "AND14",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "chip012",
                                        "fromIndex": 0,
                                        "toComponent": "AND14",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "AND14",
                                        "fromIndex": 0,
                                        "toComponent": "OUTPUTS",
                                        "toIndex": 0
                                    }
                                ],
                                "x": 302.1876925444594,
                                "y": 275.20365621954704,
                                "width": 80,
                                "height": 62,
                                "isSub": false
                            },
                            {
                                "name": "chip819",
                                "inputs": [
                                    1,
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "components": [
                                    {
                                        "name": "OR11",
                                        "type": "OR",
                                        "inputs": [
                                            1,
                                            0
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "x": 956.4313898057538,
                                        "y": 105.06792327725174,
                                        "width": 80,
                                        "height": 62
                                    },
                                    {
                                        "name": "AND14",
                                        "type": "AND",
                                        "inputs": [
                                            1,
                                            1
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "x": 276.6776190872051,
                                        "y": 401.165701474581,
                                        "width": 80,
                                        "height": 62
                                    }
                                ],
                                "chips": [
                                    {
                                        "name": "chip012",
                                        "inputs": [
                                            1,
                                            0
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "components": [
                                            {
                                                "name": "AND1",
                                                "type": "AND",
                                                "inputs": [
                                                    1,
                                                    0
                                                ],
                                                "outputs": [
                                                    0
                                                ],
                                                "x": 236.82262954565826,
                                                "y": 602.2625321313533,
                                                "width": 80,
                                                "height": 62
                                            },
                                            {
                                                "name": "NOT2",
                                                "type": "NOT",
                                                "inputs": [
                                                    0
                                                ],
                                                "outputs": [
                                                    1
                                                ],
                                                "x": 209.73667409863398,
                                                "y": 187.20054076216104,
                                                "width": 80,
                                                "height": 40
                                            }
                                        ],
                                        "chips": [],
                                        "connections": [
                                            {
                                                "fromComponent": "INPUTS",
                                                "fromIndex": 0,
                                                "toComponent": "AND1",
                                                "toIndex": 0
                                            },
                                            {
                                                "fromComponent": "INPUTS",
                                                "fromIndex": 1,
                                                "toComponent": "AND1",
                                                "toIndex": 1
                                            },
                                            {
                                                "fromComponent": "AND1",
                                                "fromIndex": 0,
                                                "toComponent": "NOT2",
                                                "toIndex": 0
                                            },
                                            {
                                                "fromComponent": "NOT2",
                                                "fromIndex": 0,
                                                "toComponent": "OUTPUTS",
                                                "toIndex": 0
                                            }
                                        ],
                                        "x": 692.0848837566276,
                                        "y": 606.6951707415735,
                                        "width": 80,
                                        "height": 62,
                                        "isSub": false
                                    }
                                ],
                                "connections": [
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "OR11",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "OR11",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "chip012",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "chip012",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "OR11",
                                        "fromIndex": 0,
                                        "toComponent": "AND14",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "chip012",
                                        "fromIndex": 0,
                                        "toComponent": "AND14",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "AND14",
                                        "fromIndex": 0,
                                        "toComponent": "OUTPUTS",
                                        "toIndex": 0
                                    }
                                ],
                                "x": 716.733638344294,
                                "y": 255.2800438063621,
                                "width": 80,
                                "height": 62,
                                "isSub": false
                            }
                        ],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "chip816",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "chip816",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "AND18",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "AND18",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 2,
                                "toComponent": "chip819",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "chip816",
                                "fromIndex": 0,
                                "toComponent": "chip819",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "chip819",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "chip816",
                                "fromIndex": 0,
                                "toComponent": "AND21",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "AND21",
                                "fromIndex": 0,
                                "toComponent": "OR22",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "AND18",
                                "fromIndex": 0,
                                "toComponent": "OR22",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "OR22",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 2,
                                "toComponent": "AND21",
                                "toIndex": 1
                            }
                        ],
                        "x": 477.2725283405845,
                        "y": 330.1495304133174,
                        "width": 80,
                        "height": 84,
                        "isSub": false
                    },
                    {
                        "name": "chip1530",
                        "inputs": [
                            0,
                            0,
                            0
                        ],
                        "outputs": [
                            0,
                            0
                        ],
                        "components": [
                            {
                                "name": "AND18",
                                "type": "AND",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 656.9568203510751,
                                "y": 638.4805928601378,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "AND21",
                                "type": "AND",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 164.01804342880368,
                                "y": 355.0868467819526,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "OR22",
                                "type": "OR",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 208.63669366543758,
                                "y": 500.76450206574924,
                                "width": 80,
                                "height": 62
                            }
                        ],
                        "chips": [
                            {
                                "name": "chip816",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "components": [
                                    {
                                        "name": "OR11",
                                        "type": "OR",
                                        "inputs": [
                                            0,
                                            0
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "x": 174.67242407343394,
                                        "y": 631.3751021826226,
                                        "width": 80,
                                        "height": 62
                                    },
                                    {
                                        "name": "AND14",
                                        "type": "AND",
                                        "inputs": [
                                            0,
                                            1
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "x": 553.6171694554886,
                                        "y": 515.617715638145,
                                        "width": 80,
                                        "height": 62
                                    }
                                ],
                                "chips": [
                                    {
                                        "name": "chip012",
                                        "inputs": [
                                            0,
                                            0
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "components": [
                                            {
                                                "name": "AND1",
                                                "type": "AND",
                                                "inputs": [
                                                    0,
                                                    0
                                                ],
                                                "outputs": [
                                                    0
                                                ],
                                                "x": 351.0236984115362,
                                                "y": 469.63529070133154,
                                                "width": 80,
                                                "height": 62
                                            },
                                            {
                                                "name": "NOT2",
                                                "type": "NOT",
                                                "inputs": [
                                                    0
                                                ],
                                                "outputs": [
                                                    1
                                                ],
                                                "x": 207.1596969867583,
                                                "y": 584.7445703443746,
                                                "width": 80,
                                                "height": 40
                                            }
                                        ],
                                        "chips": [],
                                        "connections": [
                                            {
                                                "fromComponent": "INPUTS",
                                                "fromIndex": 0,
                                                "toComponent": "AND1",
                                                "toIndex": 0
                                            },
                                            {
                                                "fromComponent": "INPUTS",
                                                "fromIndex": 1,
                                                "toComponent": "AND1",
                                                "toIndex": 1
                                            },
                                            {
                                                "fromComponent": "AND1",
                                                "fromIndex": 0,
                                                "toComponent": "NOT2",
                                                "toIndex": 0
                                            },
                                            {
                                                "fromComponent": "NOT2",
                                                "fromIndex": 0,
                                                "toComponent": "OUTPUTS",
                                                "toIndex": 0
                                            }
                                        ],
                                        "x": 111.0969640015955,
                                        "y": 229.66452981715096,
                                        "width": 80,
                                        "height": 62,
                                        "isSub": false
                                    }
                                ],
                                "connections": [
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "OR11",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "OR11",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "chip012",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "chip012",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "OR11",
                                        "fromIndex": 0,
                                        "toComponent": "AND14",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "chip012",
                                        "fromIndex": 0,
                                        "toComponent": "AND14",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "AND14",
                                        "fromIndex": 0,
                                        "toComponent": "OUTPUTS",
                                        "toIndex": 0
                                    }
                                ],
                                "x": 801.6764409842332,
                                "y": 614.7559438237752,
                                "width": 80,
                                "height": 62,
                                "isSub": false
                            },
                            {
                                "name": "chip819",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "components": [
                                    {
                                        "name": "OR11",
                                        "type": "OR",
                                        "inputs": [
                                            0,
                                            0
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "x": 474.4279498628101,
                                        "y": 532.1240328330464,
                                        "width": 80,
                                        "height": 62
                                    },
                                    {
                                        "name": "AND14",
                                        "type": "AND",
                                        "inputs": [
                                            0,
                                            1
                                        ],
                                        "outputs": [
                                            0
                                        ],
                                        "x": 227.73118814861095,
                                        "y": 449.68731661034957,
                                        "width": 80,
                                        "height": 62
                                    }
                                ],
                                "chips": [
                                    {
                                        "name": "chip012",
                                        "inputs": [
                                            0,
                                            0
                                        ],
                                        "outputs": [
                                            1
                                        ],
                                        "components": [
                                            {
                                                "name": "AND1",
                                                "type": "AND",
                                                "inputs": [
                                                    0,
                                                    0
                                                ],
                                                "outputs": [
                                                    0
                                                ],
                                                "x": 254.15190698393943,
                                                "y": 268.85583811467194,
                                                "width": 80,
                                                "height": 62
                                            },
                                            {
                                                "name": "NOT2",
                                                "type": "NOT",
                                                "inputs": [
                                                    0
                                                ],
                                                "outputs": [
                                                    1
                                                ],
                                                "x": 745.6276472733879,
                                                "y": 629.3145026476101,
                                                "width": 80,
                                                "height": 40
                                            }
                                        ],
                                        "chips": [],
                                        "connections": [
                                            {
                                                "fromComponent": "INPUTS",
                                                "fromIndex": 0,
                                                "toComponent": "AND1",
                                                "toIndex": 0
                                            },
                                            {
                                                "fromComponent": "INPUTS",
                                                "fromIndex": 1,
                                                "toComponent": "AND1",
                                                "toIndex": 1
                                            },
                                            {
                                                "fromComponent": "AND1",
                                                "fromIndex": 0,
                                                "toComponent": "NOT2",
                                                "toIndex": 0
                                            },
                                            {
                                                "fromComponent": "NOT2",
                                                "fromIndex": 0,
                                                "toComponent": "OUTPUTS",
                                                "toIndex": 0
                                            }
                                        ],
                                        "x": 184.7781533995359,
                                        "y": 612.2292048215746,
                                        "width": 80,
                                        "height": 62,
                                        "isSub": false
                                    }
                                ],
                                "connections": [
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "OR11",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "OR11",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 1,
                                        "toComponent": "chip012",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "INPUTS",
                                        "fromIndex": 0,
                                        "toComponent": "chip012",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "OR11",
                                        "fromIndex": 0,
                                        "toComponent": "AND14",
                                        "toIndex": 0
                                    },
                                    {
                                        "fromComponent": "chip012",
                                        "fromIndex": 0,
                                        "toComponent": "AND14",
                                        "toIndex": 1
                                    },
                                    {
                                        "fromComponent": "AND14",
                                        "fromIndex": 0,
                                        "toComponent": "OUTPUTS",
                                        "toIndex": 0
                                    }
                                ],
                                "x": 175.73558009313268,
                                "y": 136.3484977348594,
                                "width": 80,
                                "height": 62,
                                "isSub": false
                            }
                        ],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "chip816",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "chip816",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "AND18",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "AND18",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 2,
                                "toComponent": "chip819",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "chip816",
                                "fromIndex": 0,
                                "toComponent": "chip819",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "chip819",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "chip816",
                                "fromIndex": 0,
                                "toComponent": "AND21",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "AND21",
                                "fromIndex": 0,
                                "toComponent": "OR22",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "AND18",
                                "fromIndex": 0,
                                "toComponent": "OR22",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "OR22",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 2,
                                "toComponent": "AND21",
                                "toIndex": 1
                            }
                        ],
                        "x": 489.58939292601445,
                        "y": 181.051164523434,
                        "width": 80,
                        "height": 84,
                        "isSub": false
                    }
                ],
                "connections": [
                    {
                        "fromComponent": "chip1528",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip1524",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "chip1530",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 2
                    },
                    {
                        "fromComponent": "chip1526",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 3
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 8,
                        "toComponent": "chip1526",
                        "toIndex": 2
                    },
                    {
                        "fromComponent": "chip1526",
                        "fromIndex": 1,
                        "toComponent": "chip1530",
                        "toIndex": 2
                    },
                    {
                        "fromComponent": "chip1530",
                        "fromIndex": 1,
                        "toComponent": "chip1524",
                        "toIndex": 2
                    },
                    {
                        "fromComponent": "chip1524",
                        "fromIndex": 1,
                        "toComponent": "chip1528",
                        "toIndex": 2
                    },
                    {
                        "fromComponent": "chip1528",
                        "fromIndex": 1,
                        "toComponent": "OUTPUTS",
                        "toIndex": 4
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 7,
                        "toComponent": "chip1526",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 6,
                        "toComponent": "chip1530",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 5,
                        "toComponent": "chip1524",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 4,
                        "toComponent": "chip1528",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 3,
                        "toComponent": "chip1526",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 2,
                        "toComponent": "chip1530",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "chip1524",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "chip1528",
                        "toIndex": 0
                    }
                ],
                "x": 469.7741052245425,
                "y": 235.62218022699412,
                "width": 80,
                "height": 216,
                "isSub": false
            },
            {
                "name": "chip842",
                "inputs": [
                    0,
                    0
                ],
                "outputs": [
                    0
                ],
                "components": [
                    {
                        "name": "OR11",
                        "type": "OR",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 575.7008366244231,
                        "y": 617.6863373717765,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "AND14",
                        "type": "AND",
                        "inputs": [
                            0,
                            1
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 229.6710190213143,
                        "y": 448.62404523451147,
                        "width": 80,
                        "height": 62
                    }
                ],
                "chips": [
                    {
                        "name": "chip012",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            1
                        ],
                        "components": [
                            {
                                "name": "AND1",
                                "type": "AND",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 233.76571921825797,
                                "y": 596.8484103438574,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "NOT2",
                                "type": "NOT",
                                "inputs": [
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 691.4845263721867,
                                "y": 219.19688836582733,
                                "width": 80,
                                "height": 40
                            }
                        ],
                        "chips": [],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "AND1",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "AND1",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND1",
                                "fromIndex": 0,
                                "toComponent": "NOT2",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "NOT2",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 277.9409122076035,
                        "y": 573.6573283263288,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    }
                ],
                "connections": [
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "OR11",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "OR11",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "chip012",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "chip012",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "OR11",
                        "fromIndex": 0,
                        "toComponent": "AND14",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip012",
                        "fromIndex": 0,
                        "toComponent": "AND14",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "AND14",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 0
                    }
                ],
                "x": 443.9474100656687,
                "y": 583.9353303812693,
                "width": 80,
                "height": 62,
                "isSub": false
            },
            {
                "name": "chip844",
                "inputs": [
                    0,
                    0
                ],
                "outputs": [
                    0
                ],
                "components": [
                    {
                        "name": "OR11",
                        "type": "OR",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 735.7833300669095,
                        "y": 576.230044730424,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "AND14",
                        "type": "AND",
                        "inputs": [
                            0,
                            1
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 309.9713969435539,
                        "y": 682.789447194582,
                        "width": 80,
                        "height": 62
                    }
                ],
                "chips": [
                    {
                        "name": "chip012",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            1
                        ],
                        "components": [
                            {
                                "name": "AND1",
                                "type": "AND",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 311.83189917498316,
                                "y": 155.1069075138688,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "NOT2",
                                "type": "NOT",
                                "inputs": [
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 363.48169346782765,
                                "y": 521.648831270872,
                                "width": 80,
                                "height": 40
                            }
                        ],
                        "chips": [],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "AND1",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "AND1",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND1",
                                "fromIndex": 0,
                                "toComponent": "NOT2",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "NOT2",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 186.75228029693426,
                        "y": 257.9376677236363,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    }
                ],
                "connections": [
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "OR11",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "OR11",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "chip012",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "chip012",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "OR11",
                        "fromIndex": 0,
                        "toComponent": "AND14",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip012",
                        "fromIndex": 0,
                        "toComponent": "AND14",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "AND14",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 0
                    }
                ],
                "x": 513.0672624544038,
                "y": 636.728093766941,
                "width": 80,
                "height": 62,
                "isSub": false
            },
            {
                "name": "chip846",
                "inputs": [
                    1,
                    0
                ],
                "outputs": [
                    1
                ],
                "components": [
                    {
                        "name": "OR11",
                        "type": "OR",
                        "inputs": [
                            1,
                            0
                        ],
                        "outputs": [
                            1
                        ],
                        "x": 382.1327355015994,
                        "y": 101.95559012625975,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "AND14",
                        "type": "AND",
                        "inputs": [
                            1,
                            1
                        ],
                        "outputs": [
                            1
                        ],
                        "x": 497.5832125916884,
                        "y": 483.75421683162193,
                        "width": 80,
                        "height": 62
                    }
                ],
                "chips": [
                    {
                        "name": "chip012",
                        "inputs": [
                            1,
                            0
                        ],
                        "outputs": [
                            1
                        ],
                        "components": [
                            {
                                "name": "AND1",
                                "type": "AND",
                                "inputs": [
                                    1,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 541.354681311977,
                                "y": 326.9065329928635,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "NOT2",
                                "type": "NOT",
                                "inputs": [
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 714.27153735436,
                                "y": 304.77103699502004,
                                "width": 80,
                                "height": 40
                            }
                        ],
                        "chips": [],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "AND1",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "AND1",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND1",
                                "fromIndex": 0,
                                "toComponent": "NOT2",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "NOT2",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 921.4579710333041,
                        "y": 320.8520945667492,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    }
                ],
                "connections": [
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "OR11",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "OR11",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "chip012",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "chip012",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "OR11",
                        "fromIndex": 0,
                        "toComponent": "AND14",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip012",
                        "fromIndex": 0,
                        "toComponent": "AND14",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "AND14",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 0
                    }
                ],
                "x": 611.8087610492826,
                "y": 365.2071231963505,
                "width": 80,
                "height": 62,
                "isSub": false
            },
            {
                "name": "chip848",
                "inputs": [
                    0,
                    0
                ],
                "outputs": [
                    0
                ],
                "components": [
                    {
                        "name": "OR11",
                        "type": "OR",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 510.13182143618985,
                        "y": 486.8186728537959,
                        "width": 80,
                        "height": 62
                    },
                    {
                        "name": "AND14",
                        "type": "AND",
                        "inputs": [
                            0,
                            1
                        ],
                        "outputs": [
                            0
                        ],
                        "x": 236.37659189677493,
                        "y": 155.39037558709393,
                        "width": 80,
                        "height": 62
                    }
                ],
                "chips": [
                    {
                        "name": "chip012",
                        "inputs": [
                            0,
                            0
                        ],
                        "outputs": [
                            1
                        ],
                        "components": [
                            {
                                "name": "AND1",
                                "type": "AND",
                                "inputs": [
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0
                                ],
                                "x": 868.5141253559148,
                                "y": 402.59006181448916,
                                "width": 80,
                                "height": 62
                            },
                            {
                                "name": "NOT2",
                                "type": "NOT",
                                "inputs": [
                                    0
                                ],
                                "outputs": [
                                    1
                                ],
                                "x": 926.2557411892077,
                                "y": 191.2674403532477,
                                "width": 80,
                                "height": 40
                            }
                        ],
                        "chips": [],
                        "connections": [
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 0,
                                "toComponent": "AND1",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "INPUTS",
                                "fromIndex": 1,
                                "toComponent": "AND1",
                                "toIndex": 1
                            },
                            {
                                "fromComponent": "AND1",
                                "fromIndex": 0,
                                "toComponent": "NOT2",
                                "toIndex": 0
                            },
                            {
                                "fromComponent": "NOT2",
                                "fromIndex": 0,
                                "toComponent": "OUTPUTS",
                                "toIndex": 0
                            }
                        ],
                        "x": 900.8313506351619,
                        "y": 652.6969753385855,
                        "width": 80,
                        "height": 62,
                        "isSub": false
                    }
                ],
                "connections": [
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "OR11",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "OR11",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 1,
                        "toComponent": "chip012",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "INPUTS",
                        "fromIndex": 0,
                        "toComponent": "chip012",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "OR11",
                        "fromIndex": 0,
                        "toComponent": "AND14",
                        "toIndex": 0
                    },
                    {
                        "fromComponent": "chip012",
                        "fromIndex": 0,
                        "toComponent": "AND14",
                        "toIndex": 1
                    },
                    {
                        "fromComponent": "AND14",
                        "fromIndex": 0,
                        "toComponent": "OUTPUTS",
                        "toIndex": 0
                    }
                ],
                "x": 115.32099152074375,
                "y": 597.912945446252,
                "width": 80,
                "height": 62,
                "isSub": false
            }
        ],
        "connections": [
            {
                "fromComponent": "INPUTS",
                "fromIndex": 4,
                "toComponent": "chip848",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 5,
                "toComponent": "chip846",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 6,
                "toComponent": "chip842",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 7,
                "toComponent": "chip844",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 8,
                "toComponent": "chip844",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 8,
                "toComponent": "chip842",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 8,
                "toComponent": "chip846",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 8,
                "toComponent": "chip848",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 8,
                "toComponent": "chip2340",
                "toIndex": 8
            },
            {
                "fromComponent": "chip844",
                "fromIndex": 0,
                "toComponent": "chip2340",
                "toIndex": 7
            },
            {
                "fromComponent": "chip842",
                "fromIndex": 0,
                "toComponent": "chip2340",
                "toIndex": 6
            },
            {
                "fromComponent": "chip846",
                "fromIndex": 0,
                "toComponent": "chip2340",
                "toIndex": 5
            },
            {
                "fromComponent": "chip848",
                "fromIndex": 0,
                "toComponent": "chip2340",
                "toIndex": 4
            },
            {
                "fromComponent": "chip2340",
                "fromIndex": 0,
                "toComponent": "DISPLAY50",
                "toIndex": 0
            },
            {
                "fromComponent": "chip2340",
                "fromIndex": 1,
                "toComponent": "DISPLAY50",
                "toIndex": 1
            },
            {
                "fromComponent": "chip2340",
                "fromIndex": 2,
                "toComponent": "DISPLAY50",
                "toIndex": 2
            },
            {
                "fromComponent": "chip2340",
                "fromIndex": 3,
                "toComponent": "DISPLAY50",
                "toIndex": 3
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 3,
                "toComponent": "chip2340",
                "toIndex": 3
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 2,
                "toComponent": "chip2340",
                "toIndex": 2
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 1,
                "toComponent": "chip2340",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 0,
                "toComponent": "chip2340",
                "toIndex": 0
            },
            {
                "fromComponent": "chip2340",
                "fromIndex": 0,
                "toComponent": "OUTPUTS",
                "toIndex": 0
            },
            {
                "fromComponent": "chip2340",
                "fromIndex": 1,
                "toComponent": "OUTPUTS",
                "toIndex": 1
            },
            {
                "fromComponent": "chip2340",
                "fromIndex": 2,
                "toComponent": "OUTPUTS",
                "toIndex": 2
            },
            {
                "fromComponent": "chip2340",
                "fromIndex": 3,
                "toComponent": "OUTPUTS",
                "toIndex": 3
            },
            {
                "fromComponent": "chip2340",
                "fromIndex": 0,
                "toComponent": "NOT51",
                "toIndex": 0
            },
            {
                "fromComponent": "chip2340",
                "fromIndex": 1,
                "toComponent": "NOT53",
                "toIndex": 0
            },
            {
                "fromComponent": "chip2340",
                "fromIndex": 2,
                "toComponent": "NOT52",
                "toIndex": 0
            },
            {
                "fromComponent": "chip2340",
                "fromIndex": 3,
                "toComponent": "NOT54",
                "toIndex": 0
            },
            {
                "fromComponent": "NOT51",
                "fromIndex": 0,
                "toComponent": "AND55",
                "toIndex": 0
            },
            {
                "fromComponent": "NOT53",
                "fromIndex": 0,
                "toComponent": "AND55",
                "toIndex": 1
            },
            {
                "fromComponent": "AND55",
                "fromIndex": 0,
                "toComponent": "AND56",
                "toIndex": 0
            },
            {
                "fromComponent": "NOT52",
                "fromIndex": 0,
                "toComponent": "AND56",
                "toIndex": 1
            },
            {
                "fromComponent": "AND56",
                "fromIndex": 0,
                "toComponent": "AND57",
                "toIndex": 0
            },
            {
                "fromComponent": "NOT54",
                "fromIndex": 0,
                "toComponent": "AND57",
                "toIndex": 1
            },
            {
                "fromComponent": "AND57",
                "fromIndex": 0,
                "toComponent": "OUTPUTS",
                "toIndex": 6
            },
            {
                "fromComponent": "chip2340",
                "fromIndex": 0,
                "toComponent": "OUTPUTS",
                "toIndex": 5
            },
            {
                "fromComponent": "chip2340",
                "fromIndex": 4,
                "toComponent": "OUTPUTS",
                "toIndex": 4
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 0,
                "toComponent": "DISPLAY58",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 1,
                "toComponent": "DISPLAY58",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 2,
                "toComponent": "DISPLAY58",
                "toIndex": 2
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 3,
                "toComponent": "DISPLAY58",
                "toIndex": 3
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 4,
                "toComponent": "DISPLAY59",
                "toIndex": 0
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 5,
                "toComponent": "DISPLAY59",
                "toIndex": 1
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 6,
                "toComponent": "DISPLAY59",
                "toIndex": 2
            },
            {
                "fromComponent": "INPUTS",
                "fromIndex": 7,
                "toComponent": "DISPLAY59",
                "toIndex": 3
            }
        ],
        "x": 384.41852239588604,
        "y": 333.57272246936895,
        "width": 80,
        "height": 216,
        "isSub": true
    }
]