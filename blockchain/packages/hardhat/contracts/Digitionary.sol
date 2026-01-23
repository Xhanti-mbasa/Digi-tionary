// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Digitionary
 * @dev Decentralized dictionary/library on the blockchain.
 * Handles word creation, version control, dictionary compilation, and staking for PoS validation.
 */
contract Digitionary {
    
    struct Version {
        string content;
        string commitMsg;
        uint256 timestamp;
        address author;
    }

    struct Word {
        uint256 id;
        string term;
        address owner;
        Version[] history;
        bool active;
    }

    struct Dictionary {
        uint256 id;
        string title;
        address author;
        uint256[] wordIds;
        uint256 timestamp;
        bool published;
    }

    // State Variables
    mapping(uint256 => Word) private words;
    mapping(uint256 => Dictionary) private dictionaries;
    mapping(address => uint256) public stakes;
    mapping(address => uint256[]) public userWords;
    mapping(address => uint256[]) public userDictionaries;
    
    uint256 public wordCount;
    uint256 public dictionaryCount;
    uint256 public totalStaked;
    uint256 public constant MIN_STAKE = 0.01 ether;
    uint256 public constant WORDS_FOR_DICTIONARY = 100;

    // Events
    event WordCreated(uint256 indexed wordId, string term, address indexed author);
    event WordUpdated(uint256 indexed wordId, string commitMsg, address indexed editor);
    event DictionaryCreated(uint256 indexed dictId, string title, address indexed author);
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);

    modifier onlyStaker() {
        require(stakes[msg.sender] >= MIN_STAKE, "Must stake to participate");
        _;
    }

    /**
     * @dev Stake ETH to become a validator/participant
     */
    function stake() external payable {
        require(msg.value >= MIN_STAKE, "Minimum stake not met");
        stakes[msg.sender] += msg.value;
        totalStaked += msg.value;
        emit Staked(msg.sender, msg.value);
    }

    /**
     * @dev Unstake ETH
     */
    function unstake(uint256 amount) external {
        require(stakes[msg.sender] >= amount, "Insufficient stake");
        stakes[msg.sender] -= amount;
        totalStaked -= amount;
        payable(msg.sender).transfer(amount);
        emit Unstaked(msg.sender, amount);
    }

    /**
     * @dev Add a new word to the library
     */
    function addWord(
        string memory _term,
        string memory _content,
        string memory _commitMsg
    ) public onlyStaker returns (uint256) {
        wordCount++;
        uint256 wordId = wordCount;
        
        Word storage newWord = words[wordId];
        newWord.id = wordId;
        newWord.term = _term;
        newWord.owner = msg.sender;
        newWord.active = true;
        
        newWord.history.push(Version({
            content: _content,
            commitMsg: _commitMsg,
            timestamp: block.timestamp,
            author: msg.sender
        }));
        
        userWords[msg.sender].push(wordId);
        
        emit WordCreated(wordId, _term, msg.sender);
        return wordId;
    }

    /**
     * @dev Update an existing word with a new version
     */
    function updateWord(
        uint256 _wordId,
        string memory _content,
        string memory _commitMsg
    ) public onlyStaker {
        require(words[_wordId].active, "Word does not exist");
        
        words[_wordId].history.push(Version({
            content: _content,
            commitMsg: _commitMsg,
            timestamp: block.timestamp,
            author: msg.sender
        }));
        
        emit WordUpdated(_wordId, _commitMsg, msg.sender);
    }

    /**
     * @dev Create a dictionary from a collection of words
     */
    function createDictionary(
        string memory _title,
        uint256[] memory _wordIds
    ) public onlyStaker returns (uint256) {
        require(_wordIds.length >= 1, "Dictionary must contain words");
        // For production: require(_wordIds.length >= WORDS_FOR_DICTIONARY, "Need 100+ words");
        
        // Verify all words exist
        for (uint i = 0; i < _wordIds.length; i++) {
            require(words[_wordIds[i]].active, "Invalid word ID");
        }
        
        dictionaryCount++;
        uint256 dictId = dictionaryCount;
        
        Dictionary storage newDict = dictionaries[dictId];
        newDict.id = dictId;
        newDict.title = _title;
        newDict.author = msg.sender;
        newDict.wordIds = _wordIds;
        newDict.timestamp = block.timestamp;
        newDict.published = true;
        
        userDictionaries[msg.sender].push(dictId);
        
        emit DictionaryCreated(dictId, _title, msg.sender);
        return dictId;
    }

    // View Functions
    
    function getWord(uint256 _wordId) public view returns (
        uint256 id,
        string memory term,
        address owner,
        bool active,
        uint256 versionCount
    ) {
        Word storage w = words[_wordId];
        return (w.id, w.term, w.owner, w.active, w.history.length);
    }
    
    function getWordVersion(uint256 _wordId, uint256 _versionIndex) public view returns (
        string memory content,
        string memory commitMsg,
        uint256 timestamp,
        address author
    ) {
        require(_versionIndex < words[_wordId].history.length, "Invalid version");
        Version storage v = words[_wordId].history[_versionIndex];
        return (v.content, v.commitMsg, v.timestamp, v.author);
    }
    
    function getLatestWordContent(uint256 _wordId) public view returns (
        string memory term,
        string memory content,
        string memory commitMsg,
        uint256 timestamp,
        address author
    ) {
        Word storage w = words[_wordId];
        require(w.history.length > 0, "No versions");
        Version storage latest = w.history[w.history.length - 1];
        return (w.term, latest.content, latest.commitMsg, latest.timestamp, latest.author);
    }
    
    function getDictionary(uint256 _dictId) public view returns (
        uint256 id,
        string memory title,
        address author,
        uint256 wordCount,
        uint256 timestamp,
        bool published
    ) {
        Dictionary storage d = dictionaries[_dictId];
        return (d.id, d.title, d.author, d.wordIds.length, d.timestamp, d.published);
    }
    
    function getDictionaryWordIds(uint256 _dictId) public view returns (uint256[] memory) {
        return dictionaries[_dictId].wordIds;
    }
    
    function getUserWords(address _user) public view returns (uint256[] memory) {
        return userWords[_user];
    }
    
    function getUserDictionaries(address _user) public view returns (uint256[] memory) {
        return userDictionaries[_user];
    }
    
    function getStake(address _user) public view returns (uint256) {
        return stakes[_user];
    }
    
    function getStats() public view returns (
        uint256 totalWords,
        uint256 totalDictionaries,
        uint256 totalStakedAmount
    ) {
        return (wordCount, dictionaryCount, totalStaked);
    }
}
